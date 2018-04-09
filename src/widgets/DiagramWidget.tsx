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
  diagramEngine: DiagramEngine;

  actionStartedFiring?: (action: BaseAction) => boolean;
  actionStillFiring?: (action: BaseAction) => void;
  actionStoppedFiring?: (action: BaseAction) => void;
}

export interface DiagramState {
  action: BaseAction | null;
  wasMoved: boolean;
  renderedNodes: boolean;
  windowListener: any;
  diagramEngineListener: any;
  document: any;
}

@observer
export class DiagramWidget extends React.Component<DiagramProps & React.HTMLProps<HTMLDivElement>> {
  constructor(props: DiagramProps) {
    super(props);
    this.state = {
      action: null,
      wasMoved: false,
      renderedNodes: false,
      windowListener: null,
      diagramEngineListener: null,
      document: null
    };

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

    this.setState({
      document,
      renderedNodes: true,
    });

    // dont focus the window when in test mode - jsdom fails
    if (process.env.NODE_ENV !== 'test') {
      window.focus();
    }
  }

  componentWillUnmount() {
    this.props.diagramEngine.canvas = null;
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  componentWillUpdate(nextProps: DiagramProps) {
    if (this.props.diagramEngine.model.id !== nextProps.diagramEngine.model.id) {
      this.setState({ renderedNodes: false });
      nextProps.diagramEngine.model.rendered = true;
    }
    if (!nextProps.diagramEngine.model.rendered) {
      this.setState({ renderedNodes: false });
      nextProps.diagramEngine.model.rendered = true;
    }
  }

  /**
   * Gets a model and element under the mouse cursor
   */
  getModelAtPosition(event: MouseEvent): BaseModel<BaseEntity, BaseModelListener> | undefined {
    const target = event.target as Element;
    const model = this.props.diagramEngine.model;

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
    if (this.state.action && this.props.actionStillFiring) {
      this.props.actionStillFiring(this.state.action);
    }
  }

  stopFiringAction(shouldSkipEvent?: boolean) {
    if (this.props.actionStoppedFiring && !shouldSkipEvent) {
      if (this.state.action) {
        this.props.actionStoppedFiring(this.state.action);
      }
    }
    this.setState({ action: null });
  }

  startFiringAction(action: BaseAction) {
    let setState = true;
    if (this.props.actionStartedFiring) {
      setState = this.props.actionStartedFiring(action);
    }
    if (setState) {
      this.setState({ action });
    }
  }

  onMouseMove(event: MouseEvent) {
    const engine = this.props.diagramEngine;
    const model = engine.model;
    if (this.state.action instanceof SelectingAction) {
      model.nodes.forEach((node) => {
        if ((this.state.action as SelectingAction).containsElement(node.x, node.y, model)) {
          node.selected = true;
        }
      });

      model.links.forEach((link) => {
        let allSelected = true;
        _.forEach(link.points, (point) => {
          if ((this.state.action as SelectingAction).containsElement(point.x, point.y, model)) {
            point.selected = true;
          } else {
            allSelected = false;
          }
        });

        if (allSelected) {
          link.selected = true;
        }
      });

      const relative = engine.getRelativePoint(event.clientX, event.clientY);
      this.state.action.mouseX2 = relative.x;
      this.state.action.mouseY2 = relative.y;

      this.fireAction();
      this.setState({ action: this.state.action });
    } else if (this.state.action instanceof MoveItemsAction) {
      const amountX = event.clientX - this.state.action.mouseX;
      const amountY = event.clientY - this.state.action.mouseY;
      const amountZoom = model.zoom / 100;
      this.state.action.selectionModels.forEach((selModel) => {
        // in this case we need to also work out the relative grid position
        if (
          selModel.model instanceof NodeModel ||
          (selModel.model instanceof PointModel && !selModel.model.isConnectedToPort())
        ) {
          const x = model.getGridPosition(selModel.initialX + amountX / amountZoom);
          const y = model.getGridPosition(selModel.initialY + amountY / amountZoom);
          selModel.model.setPosition(x, y);

          if (engine.isSmartRoutingEnabled()) {
            engine.calculateRoutingMatrix();
          }
        } else if (selModel.model instanceof PointModel) {
          // we want points that are connected to ports, to not necessarily snap to grid
          // this stuff needs to be pixel perfect, dont touch it
          selModel.model.x = selModel.initialX + model.getGridPosition(amountX / amountZoom);
          selModel.model.y = selModel.initialY + model.getGridPosition(amountY / amountZoom);
        }
      });

      if (engine.isSmartRoutingEnabled()) {
        engine.calculateCanvasMatrix();
      }

      this.fireAction();
      if (!this.state.wasMoved) {
        this.setState({ wasMoved: true });
      } else {
        this.forceUpdate();
      }
    } else if (this.state.action instanceof MoveCanvasAction) {
      // translate the actual canvas
      if (this.props.allowCanvasTranslation) {
        model.setOffset(
          this.state.action.initialOffsetX + (event.clientX - this.state.action.mouseX),
          this.state.action.initialOffsetY + (event.clientY - this.state.action.mouseY)
        );
        this.fireAction();
        this.forceUpdate();
      }
    }
  }

  onKeyUp(event: KeyboardEvent) {
    // delete all selected
    if (this.props.deleteKeys!.indexOf(event.keyCode) !== -1) {
      this.props.diagramEngine.model.getSelectedItems().forEach((element) => {
        // only delete items which are not locked
        if (!this.props.diagramEngine.isModelLocked(element)) {
          element.remove();
        }
      });
      this.forceUpdate();
    }
  }

  onMouseUp(event: MouseEvent) {
    const diagramEngine = this.props.diagramEngine;
    // are we going to connect a link to something?
    if (this.state.action instanceof MoveItemsAction) {
      const elModel = this.getModelAtPosition(event);
      // tslint:disable-next-line
      console.log('[mouseup] MoveItemsAction', this.state.action.selectionModels);
      _.forEach(this.state.action.selectionModels, (model) => {
        // only care about points connecting to things
        if (!(model.model instanceof PointModel)) {
          return;
        }
        if (elModel && elModel instanceof PortModel && !diagramEngine.isModelLocked(elModel)) {
          const link = model.model.parent!;
          if (link.targetPort !== null) {
            // if this was a valid link already and we are adding a node in the middle, create 2 links from the original
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
                diagramEngine.model.addLink(newLink);
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
              diagramEngine.model.connectLink(link);
            }
          }
          delete this.props.diagramEngine.linksThatHaveInitiallyRendered[link.id];
        }
      });

      // check for / remove any loose links which have been moved
      if (!this.props.allowLooseLinks && this.state.wasMoved) {
        // tslint:disable-next-line
        console.log('[mouseup] noLooseLinks + wasMoved', this.state.action.selectionModels);
        _.forEach(this.state.action.selectionModels, (model) => {
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
      _.forEach(this.state.action.selectionModels, (model) => {
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

      diagramEngine.clearRepaintEntities();
      this.stopFiringAction(!this.state.wasMoved);
    } else {
      diagramEngine.clearRepaintEntities();
      this.stopFiringAction();
    }
    this.state.document.removeEventListener('mousemove', this.onMouseMove);
    this.state.document.removeEventListener('mouseup', this.onMouseUp);
  }

  drawSelectionBox() {
    const dimensions = (this.state.action as SelectingAction).getBoxDimensions();
    return (
      <div
        className="selection-box"
        style={{
          top: dimensions.top,
          left: dimensions.left,
          width: dimensions.width,
          height: dimensions.height
        }}
      />
    );
  }

  onWheel(event: React.WheelEvent<HTMLDivElement>) {
    const model = this.props.diagramEngine.model;

    if (this.props.allowCanvasZoom) {
      event.preventDefault();
      event.stopPropagation();
      const oldZoomFactor = model.zoom / 100;
      let scrollDelta = this.props.inverseZoom ? event.deltaY : -event.deltaY;
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

      this.props.diagramEngine.enableRepaintEntities([]);
      this.forceUpdate();
    }
  }

  onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    this.setState({ ...this.state, wasMoved: false });
    const model = this.props.diagramEngine.model;

    this.props.diagramEngine.clearRepaintEntities();
    const elModel = this.getModelAtPosition(event.nativeEvent);
    // tslint:disable-next-line
    console.log('[mousedown] selected model', elModel);
    if (elModel) {
      if (elModel instanceof PortModel) {
        // its a port element, we want to drag a link
        if (!this.props.diagramEngine.isModelLocked(elModel)) {
          const { x, y } = this.props.diagramEngine.getRelativeMousePoint(event);
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
            this.startFiringAction(new MoveItemsAction(event.clientX, event.clientY, this.props.diagramEngine));
          }
        } else {
          model.clearSelection();
        }
      } else {
        // its some or other element, probably want to move it
        if (!event.shiftKey && !elModel.selected) {
          model.clearSelection();
        }
        elModel.selected = true;
        // tslint:disable-next-line
        console.log('[mousedown] selected model fire action MOVE', { x: event.clientX, y: event.clientY });
        this.startFiringAction(new MoveItemsAction(event.clientX, event.clientY, this.props.diagramEngine));
      }
    } else {
      // no selection: the canvas was selected
      if (event.shiftKey) {
        // it is a "multiple selection" action
        const { x, y } = this.props.diagramEngine.getRelativePoint(event.clientX, event.clientY);
        this.startFiringAction(new SelectingAction(x, y));
      } else {
        // it is a "move the canvas" action
        model.clearSelection();
        this.startFiringAction(new MoveCanvasAction(event.clientX, event.clientY, model));
      }
    }

    this.state.document.addEventListener('mousemove', this.onMouseMove);
    this.state.document.addEventListener('mouseup', this.onMouseUp);
  }

  pointAdded(point: PointModel, event: MouseEvent) {
    this.state.document.addEventListener('mousemove', this.onMouseMove);
    this.state.document.addEventListener('mouseup', this.onMouseUp);
    event.stopPropagation();
    this.props.diagramEngine.model.clearSelection(point);
    this.setState({
      action: new MoveItemsAction(event.clientX, event.clientY, this.props.diagramEngine)
    });
  }

  render() {
    const diagramEngine = this.props.diagramEngine;
    diagramEngine.setMaxNumberPointsPerLink(this.props.maxNumberPointsPerLink!);
    diagramEngine.setSmartRoutingStatus(this.props.smartRouting!);

    return (
      <div
        className={cx('srd-diagram', this.props.className)}
        ref={(ref) => (this.props.diagramEngine.canvas = ref)}
        onWheel={this.onWheel}
        onMouseDown={this.onMouseDown}
      >
        {this.state.renderedNodes && <LinkLayerWidget diagramEngine={diagramEngine} pointAdded={this.pointAdded} />}
        <NodeLayerWidget diagramEngine={diagramEngine} />
        {this.state.action instanceof SelectingAction && this.drawSelectionBox()}
      </div>
    );
  }
}
