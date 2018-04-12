import * as React from 'react';
import * as cx from 'classnames';
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
import { BaseModel } from '../models/BaseModel';
import { BaseEntity } from '../BaseEntity';
import { CreateLinkAction } from '../actions/CreateLinkAction';

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
  getModelAtPosition(event: MouseEvent): { el: Element, model: BaseModel<BaseEntity> | undefined } {
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
            return { el: target, model: port };
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
            return { el: target, model: point };
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
          return { el: target, model: link };
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
          return { el: target, model: node };
        }
      }
    }

    return { el: target, model: undefined };
  }

  fireAction() {
    if (this.props.engine.action && this.props.actionStillFiring) {
      this.props.actionStillFiring(this.props.engine.action);
    }
  }

  stopFiringAction(shouldSkipEvent?: boolean) {
    if (this.props.actionStoppedFiring && !shouldSkipEvent) {
      if (this.props.engine.action) {
        this.props.engine.action.end = Date.now();
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

  onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    const { el, model } = this.getModelAtPosition(event.nativeEvent);

    // tslint:disable-next-line
    console.log('[mousedown] model at position', model);
    if (model) {
      if (model instanceof PortModel) {
        // its a port element, we want to create a link
        if (!this.props.engine.model.locked && !model.locked) {
          const { x, y } = this.props.engine.getRelativeMousePoint(event);
          const link = this.props.engine
            .getPortFactory(model.type)
            .getLinkFactory()
            .getNewInstance();
          // define link source to be the current clicked port
          link.sourcePort = model;
          // update auto-generated link's firstPoint to mouse position
          link.firstPoint.setPosition(x, y);
          // update auto-generated link's lastPoint to mouse position
          link.lastPoint.setPosition(x, y);
          // unselect all
          this.props.engine.model.clearSelection();
          // select link & last point
          link.selected = true;
          link.lastPoint.selected = true;
          this.props.engine.model.addLink(link);
          // tslint:disable-next-line
          console.log('[mousedown] create link action', link);
          this.startFiringAction(new CreateLinkAction(event.clientX, event.clientY, link));
        }
      } else if (model instanceof LinkModel) {
        // we want to create a point
        if (!this.props.engine.model.locked && !model.locked) {
          if (event.shiftKey) {
            // we want to select the link
            model.selected = true;
          } else {
            // we want to add a point to a link
            const { x, y } = this.props.engine.getRelativeMousePoint(event);
            const point = this.props.engine
              .getLinkFactory(model.type)
              .getPointFactory()
              .getNewInstance({ x, y });
            this.props.engine.model.clearSelection();
            point.selected = true;
            let segmentIndex: number | undefined;
            const segEl = Toolkit.closest(el, 'srd-segment');
            if (segEl) {
              segmentIndex = parseInt(segEl.getAttribute('srd-id'), 10) || undefined;
            }
            model.addPoint(point, segmentIndex);
            const action = new MoveItemsAction(event.clientX, event.clientY, this.props.engine);
            // tslint:disable-next-line
            console.log('[mousedown] new MoveItemsAction()', action.selectionModels.slice());
            this.startFiringAction(action);
          }
        }
      } else {
        // mousedown on an element (not a port): probably wants to move it
        if (!event.shiftKey && !model.selected) {
          this.props.engine.model.clearSelection();
        }

        if (!model.selected) {
          model.selected = true;
        }
        const action = new MoveItemsAction(event.clientX, event.clientY, this.props.engine);
        // tslint:disable-next-line
        console.log('[mousedown] new MoveItemsAction()', action.selectionModels.slice());
        this.startFiringAction(action);
      }
    } else {
      // no selection: the canvas was selected
      if (event.shiftKey) {
        // it is a "multiple selection" action
        const { x, y } = this.props.engine.getRelativePoint(event.clientX, event.clientY);
        this.startFiringAction(new SelectingAction(x, y));
      } else {
        // it is a "move the canvas" action
        this.props.engine.model.clearSelection();
        this.startFiringAction(new MoveCanvasAction(event.clientX, event.clientY, this.props.engine.model));
      }
    }

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove(event: MouseEvent) {
    event.preventDefault();
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
    } else if (this.props.engine.action instanceof CreateLinkAction) {
      const { x, y } = this.props.engine.getRelativeMousePoint(event);
      this.props.engine.action.link.lastPoint.setPosition(x, y);
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
        model.offsetX = this.props.engine.action.initialOffsetX + (event.clientX - this.props.engine.action.mouseX);
        model.offsetY = this.props.engine.action.initialOffsetY + (event.clientY - this.props.engine.action.mouseY);
        this.fireAction();
      }
    }
  }

  onMouseUp(event: MouseEvent) {
    event.preventDefault();
    if (this.props.engine.action instanceof CreateLinkAction) {
      const link = this.props.engine.action.link;
      const { model } = this.getModelAtPosition(event);
      if (model) {
        if (!model.locked && !this.props.engine.model.locked) {
          if (model instanceof PortModel) {
            // prevent sourcePort === targetPort
            if (link.sourcePort !== model) {
              link.targetPort = model;
              const { x, y } = this.props.engine.getRelativeMousePoint(event);
              link.lastPoint.setPosition(x, y);
            }
          } else {
            // link has been dropped on something that is not a PortModel
            // so it will dangel: verify
            if (!this.props.engine.model.allowLooseLinks) {
              link.remove();
            }
          }
        } else {
          // element or model is locked: remove link
          link.remove();
        }
      } else {
        // no element where link ended
        if (!this.props.engine.model.allowLooseLinks) {
          link.remove();
        }
      }
    }

    this.stopFiringAction();
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  onKeyUp(event: KeyboardEvent) {
    event.preventDefault();
    // delete all selected
    if (this.props.engine.model.deleteKeys.indexOf(event.keyCode) !== -1) {
      // only delete items if model is not locked
      if (!this.props.engine.model.locked) {
        // tslint:disable-next-line
        console.log('[keyup] delete', this.props.engine.model.selectedEntities);
        this.props.engine.model.selectedEntities.forEach((element) => {
          // only delete items which are not locked
          if (!element.locked) {
            element.remove();
          }
        });
      }
    }
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

      model.offsetX = model.offsetX - widthDiff * xFactor;
      model.offsetY = model.offsetY - heightDiff * yFactor;
    }
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
        {this.props.engine.action instanceof SelectingAction && (
          <div className="selection-box" style={this.props.engine.action.styles} />
        )}
      </div>
    );
  }
}
