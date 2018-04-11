import * as React from 'react';
import * as cx from 'classnames';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { DiagramEngine } from '../DiagramEngine';
import { LinkLayerWidget } from './layers/LinkLayerWidget';
import { NodeLayerWidget } from './layers/NodeLayerWidget';
import { Toolkit } from '../Toolkit';
import { BaseAction } from '../actions/BaseAction';
import { MoveCanvasAction } from '../actions/MoveCanvasAction';
import { MoveItemsAction } from '../actions/MoveItemsAction';
import { SelectingAction } from '../actions/SelectingAction';
import { NodeModel } from '../models/NodeModel';
import { PointModel } from '../models/PointModel';
import { PortModel } from '../models/PortModel';
import { LinkModel } from '../models/LinkModel';
import { BaseModel, BaseModelListener } from '../models/BaseModel';
import { BaseEntity } from '../BaseEntity';

export interface DiagramProps {
  engine: DiagramEngine;

  actionStartedFiring?: (action: BaseAction) => boolean;
  actionStillFiring?: (action: BaseAction) => void;
  actionStoppedFiring?: (action: BaseAction) => void;
}

export interface DiagramState {
  action: BaseAction | null;
  wasMoved: boolean;
  windowListener: any;
  diagramEngineListener: any;
  document: any;
}

@observer
export class DiagramWidget extends React.Component<DiagramProps & React.HTMLProps<HTMLDivElement>> {
  constructor(props: DiagramProps) {
    super(props);

    this.onWheel = this.onWheel.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.pointAdded = this.pointAdded.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
  }

  componentDidMount() {
    // add a keyboard listener
    window.addEventListener('keyup', this.onKeyUp);

    // dont focus the window when in test mode - jsdom fails
    if (process.env.NODE_ENV !== 'test') {
      window.focus();
    }
  }

  componentWillUnmount() {
    this.props.engine.canvas = null;
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  /**
   * Gets a model and element under the mouse cursor
   */
  getModelAtPosition(event: MouseEvent): BaseModel<BaseEntity, BaseModelListener> | undefined {
    const target = event.target as Element;
    const model = this.props.engine.model;

    // look for a port
    let element = Toolkit.closest(target, '.srd-port[srd-id]');
    if (element) {
      const nodeElement = Toolkit.closest(target, '.srd-node[srd-id]');
      const nodeId = nodeElement.getAttribute('srd-id');
      const portId = element.getAttribute('srd-id');
      if (nodeId && portId) {
        const node = model.getNode(nodeId);
        if (node) {
          const port = node.getPortFromID(portId);
          if (port) {
            return port;
          }
        }
      }
    }

    // look for a point
    element = Toolkit.closest(target, '.srd-point[srd-id]');
    if (element) {
      const pointId = element.getAttribute('srd-id');
      const linkId = element.getAttribute('srd-link-id');
      if (pointId && linkId) {
        const link = model.getLink(linkId);
        if (link) {
          const point = link.getPointModel(pointId);
          if (point) {
            return point;
          }
        }
      }
    }

    // look for a link
    element = Toolkit.closest(target, '.srd-link[srd-id]');
    if (element) {
      const linkId = element.getAttribute('srd-id');
      if (linkId) {
        const link = model.getLink(linkId);
        if (link) {
          return link;
        }
      }
    }

    // look for a node
    element = Toolkit.closest(target, '.srd-node[srd-id]');
    if (element) {
      const nodeId = element.getAttribute('srd-id');
      if (nodeId) {
        const node = model.getNode(nodeId);
        if (node) {
          return node;
        }
      }
    }

    return;
  }

  fireAction() {
    if (this.props.engine.action && this.props.actionStillFiring) {
      this.props.actionStillFiring(this.props.engine.action);
    }
  }

  stopFiringAction(shouldSkipEvent?: boolean) {
    if (this.props.actionStoppedFiring && !shouldSkipEvent) {
      if (this.props.engine.action) {
        this.props.actionStoppedFiring(this.props.engine.action);
      }
    }
    this.props.engine.action = null;
  }

  startFiringAction(action: BaseAction) {
    let allowedAction = true;
    if (this.props.actionStartedFiring) {
      allowedAction = this.props.actionStartedFiring(action);
    }
    if (allowedAction) {
      this.props.engine.action = action;
    }
  }

  onMouseMove(event: MouseEvent) {
    const engine = this.props.engine;
    const model = engine.model;
    if (this.props.engine.action instanceof SelectingAction) {
      const selectionAction = this.props.engine.action as SelectingAction;
      model.nodes.forEach((node) => {
        node.selected = selectionAction.containsElement({ x: node.x, y: node.y, model });
      });

      model.links.forEach((link) => {
        let atLeastOneSelected = false;
        link.points.forEach((point) => {
          point.selected = selectionAction.containsElement({ x: point.x, y: point.y, model });
          if (point.selected) {
            atLeastOneSelected = true;
          }
        });

        link.selected = atLeastOneSelected;
      });

      const relative = engine.getRelativePoint(event.clientX, event.clientY);
      this.props.engine.action.mouseX2 = relative.x;
      this.props.engine.action.mouseY2 = relative.y;

      this.fireAction();
    } else if (this.props.engine.action instanceof MoveItemsAction) {
      const amountX = event.clientX - this.props.engine.action.mouseX;
      const amountY = event.clientY - this.props.engine.action.mouseY;
      const amountZoom = model.zoom / 100;
      this.props.engine.action.selectionModels.forEach((selModel) => {
        // in this case we need to also work out the relative grid position
        if (
          selModel.model instanceof NodeModel ||
          (selModel.model instanceof PointModel && !selModel.model.isConnectedToPort())
        ) {
          const x = model.getGridPosition(selModel.initialX + amountX / amountZoom);
          const y = model.getGridPosition(selModel.initialY + amountY / amountZoom);
          selModel.model.setPosition(x, y);

          if (engine.model.smartRouting) {
            engine.calculateRoutingMatrix();
          }
        } else if (selModel.model instanceof PointModel) {
          // we want points that are connected to ports, to not necessarily snap to grid
          // this stuff needs to be pixel perfect, dont touch it
          selModel.model.x = selModel.initialX + model.getGridPosition(amountX / amountZoom);
          selModel.model.y = selModel.initialY + model.getGridPosition(amountY / amountZoom);
        }
      });

      if (engine.model.smartRouting) {
        engine.calculateCanvasMatrix();
      }

      this.fireAction();
    } else if (this.props.engine.action instanceof MoveCanvasAction) {
      // translate the actual canvas
      if (engine.model.allowCanvasTranslation) {
        model.setOffset(
          this.props.engine.action.initialOffsetX + (event.clientX - this.props.engine.action.mouseX),
          this.props.engine.action.initialOffsetY + (event.clientY - this.props.engine.action.mouseY)
        );
        this.fireAction();
      }
    }
  }

  onKeyUp(event: KeyboardEvent) {
    // delete all selected
    if (this.props.engine.model.deleteKeys!.indexOf(event.keyCode) !== -1) {
      this.props.engine.model.getSelectedItems().forEach((element) => {
        // only delete items which are not locked
        if (!this.props.engine.model.locked && !element.locked) {
          element.remove();
        }
      });
    }
  }

  onMouseUp(event: MouseEvent) {
    // are we going to connect a link to something?
    if (this.props.engine.action instanceof MoveItemsAction) {
      const elModel = this.getModelAtPosition(event);
      // tslint:disable-next-line
      console.log('[mouseup] MoveItemsAction', this.props.engine.action.selectionModels);
      this.props.engine.action.selectionModels.forEach((model) => {
        // only care about points connecting to things
        if (!(model.model instanceof PointModel)) {
          return;
        }
        if (elModel && (elModel instanceof PortModel) && !this.props.engine.model.locked && !elModel.locked) {
          const link = model.model.parent!;
          if (link.targetPort) {
            // we are adding a point in the middle: create 2 links from the original
            if (link.targetPort !== elModel && link.sourcePort !== elModel) {
              const targetPort = link.targetPort;
              if (targetPort) {
                const newLink = link.clone({});
                newLink.setSourcePort(elModel);
                newLink.setTargetPort(targetPort);
                link.targetPort = elModel;
                targetPort.removeLink(link);
                newLink.removePointsBefore(newLink.getPoints()[link.getPointIndex(model.model)]);
                link.removePointsAfter(model.model);
                this.props.engine.model.addLink(newLink);
              } else {
                // TODO ?? what do we do if targetPort is null
              }
              // if we are connecting to the same target or source, remove tweener points
            } else if (link.targetPort === elModel) {
              link.removePointsAfter(model.model);
            } else if (link.sourcePort === elModel) {
              link.removePointsBefore(model.model);
            }
          } else {
            // if we are just clicking on a port, then remove the link
            if (link.sourcePort === elModel) {
              link.remove();
            } else {
              link.targetPort = elModel;
              this.props.engine.model.connectLink(link);
            }
          }
        }
      });

      // check for / remove any loose links which have been moved
      if (!this.props.engine.model.allowLooseLinks) {
        // tslint:disable-next-line
        console.log('[mouseup] noLooseLinks + wasMoved', this.props.engine.action.selectionModels);
        _.forEach(this.props.engine.action.selectionModels, (model) => {
          // only care about points connecting to things
          if (!(model.model instanceof PointModel)) {
            return;
          }

          const selectedPoint: PointModel = model.model;
          const link: LinkModel = selectedPoint.parent!;
          if (link.sourcePort === null || link.targetPort === null) {
            link.remove();
          }
        });
      }

      // remove any invalid links
      _.forEach(this.props.engine.action.selectionModels, (model) => {
        // only care about points connecting to things
        if (!(model.model instanceof PointModel)) {
          return;
        }

        const link = model.model.parent!;
        const sourcePort = link.sourcePort;
        const targetPort = link.targetPort;
        if (sourcePort !== null && targetPort !== null) {
          if (!sourcePort.canLinkToPort(targetPort)) {
            // link not allowed
            link.remove();
          }
        }
      });
    }
    this.stopFiringAction();
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  onWheel(event: React.WheelEvent<HTMLDivElement>) {
    const model = this.props.engine.model;

    if (model.allowCanvasZoom) {
      event.preventDefault();
      event.stopPropagation();
      const oldZoomFactor = model.zoom / 100;
      let scrollDelta = model.inverseZoom ? event.deltaY : -event.deltaY;
      // check if it is pinch gesture
      if (event.ctrlKey && scrollDelta % 1 !== 0) {
        /*Chrome and Firefox sends wheel event with deltaY that
					have fractional part, also `ctrlKey` prop of the event is true
					though ctrl isn't pressed
				*/
        scrollDelta /= 3;
      } else {
        scrollDelta /= 60;
      }
      if (model.zoom + scrollDelta > 10) {
        model.zoom = model.zoom + scrollDelta;
      }

      const zoomFactor = model.zoom / 100;

      const boundingRect = event.currentTarget.getBoundingClientRect();
      const clientWidth = boundingRect.width;
      const clientHeight = boundingRect.height;
      // compute difference between rect before and after scroll
      const widthDiff = clientWidth * zoomFactor - clientWidth * oldZoomFactor;
      const heightDiff = clientHeight * zoomFactor - clientHeight * oldZoomFactor;
      // compute mouse coords relative to canvas
      const clientX = event.clientX - boundingRect.left;
      const clientY = event.clientY - boundingRect.top;

      // compute width and height increment factor
      const xFactor = (clientX - model.offsetX) / oldZoomFactor / clientWidth;
      const yFactor = (clientY - model.offsetY) / oldZoomFactor / clientHeight;

      model.setOffset(model.offsetX - widthDiff * xFactor, model.offsetY - heightDiff * yFactor);
    }
  }

  onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    const model = this.props.engine.model;

    const elModel = this.getModelAtPosition(event.nativeEvent);
    // tslint:disable-next-line
    console.log('[mousedown] selected model', elModel);
    if (elModel) {
      if (elModel instanceof PortModel) {
        // its a port element, we want to create a link
        if (!this.props.engine.model.locked && !elModel.locked) {
          const { x, y } = this.props.engine.getRelativeMousePoint(event);
          const link = elModel.createLinkModel();
          if (link) {
            // define link source to be the current clicked port
            link.sourcePort = elModel;
            // update auto-generated link's firstPoint to mouse position
            link.getFirstPoint().setPosition(x, y);
            // update auto-generated link's lastPoint to mouse position
            link.getLastPoint().setPosition(x, y);
            // unselect all
            model.clearSelection();
            // select link & last point
            link.selected = true;
            link.getLastPoint().selected = true;
            model.addLink(link);
            // tslint:disable-next-line
            console.log('[mousedown] onMouseDown.link create', link);
            this.startFiringAction(new MoveItemsAction(event.clientX, event.clientY, this.props.engine));
          }
        } else {
          model.clearSelection();
        }
      } else {
        // mousedown on an element (not a port): probably wants to move it
        if (!event.shiftKey && !elModel.selected) {
          model.clearSelection();
        }
        elModel.selected = true;
        // tslint:disable-next-line
        console.log('[mousedown] create MoveItemsAction', elModel);
        this.startFiringAction(new MoveItemsAction(event.clientX, event.clientY, this.props.engine));
      }
    } else {
      // no selection: the canvas was selected
      if (event.shiftKey) {
        // it is a "multiple selection" action
        const { x, y } = this.props.engine.getRelativePoint(event.clientX, event.clientY);
        this.startFiringAction(new SelectingAction(x, y));
      } else {
        // it is a "move the canvas" action
        model.clearSelection();
        this.startFiringAction(new MoveCanvasAction(event.clientX, event.clientY, model));
      }
    }

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  pointAdded(point: PointModel, event: MouseEvent) {
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    event.stopPropagation();
    this.props.engine.model.clearSelection(point);
    this.props.engine.action = new MoveItemsAction(event.clientX, event.clientY, this.props.engine);
  }

  render() {
    const diagramEngine = this.props.engine;

    return (
      <div
        className={cx('srd-diagram', this.props.className)}
        ref={(ref) => (this.props.engine.canvas = ref)}
        onWheel={this.onWheel}
        onMouseDown={this.onMouseDown}
      >
        <LinkLayerWidget engine={diagramEngine} />
        <NodeLayerWidget engine={diagramEngine} />
        {this.props.engine.action instanceof SelectingAction
          && <div className="selection-box" style={this.props.engine.action.styles} />}
      </div>
    );
  }
}
