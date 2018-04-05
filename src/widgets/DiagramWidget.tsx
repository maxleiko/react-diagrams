import * as React from 'react';
import { DiagramEngine } from '../DiagramEngine';
import * as _ from 'lodash';
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
import { BaseWidget, BaseWidgetProps } from './BaseWidget';

export interface DiagramProps extends BaseWidgetProps {
  diagramEngine: DiagramEngine;

  allowLooseLinks?: boolean;
  allowCanvasTranslation?: boolean;
  allowCanvasZoom?: boolean;
  inverseZoom?: boolean;
  maxNumberPointsPerLink?: number;
  smartRouting?: boolean;

  actionStartedFiring?: (action: BaseAction) => boolean;
  actionStillFiring?: (action: BaseAction) => void;
  actionStoppedFiring?: (action: BaseAction) => void;

  deleteKeys?: number[];
}

export interface DiagramState {
  action: BaseAction | null;
  wasMoved: boolean;
  renderedNodes: boolean;
  windowListener: any;
  diagramEngineListener: any;
  document: any;
}

/**
 * @author Dylan Vorster
 */
export class DiagramWidget extends BaseWidget<DiagramProps, DiagramState> {
  static defaultProps: Partial<DiagramProps> = {
    allowLooseLinks: true,
    allowCanvasTranslation: true,
    allowCanvasZoom: true,
    inverseZoom: false,
    maxNumberPointsPerLink: Infinity, // backwards compatible default
    smartRouting: false,
    deleteKeys: [46, 8]
  };

  constructor(props: DiagramProps) {
    super('srd-diagram', props);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.state = {
      action: null,
      wasMoved: false,
      renderedNodes: false,
      windowListener: null,
      diagramEngineListener: null,
      document: null
    };
  }

  onKeyUpPointer: (this: Window, ev: KeyboardEvent) => void = () => null;

  componentWillUnmount() {
    this.props.diagramEngine.removeListener(this.state.diagramEngineListener);
    this.props.diagramEngine.setCanvas(null);
    window.removeEventListener('keyup', this.onKeyUpPointer);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
  }

  componentWillReceiveProps(nextProps: DiagramProps) {
    if (this.props.diagramEngine !== nextProps.diagramEngine) {
      this.props.diagramEngine.removeListener(this.state.diagramEngineListener);
      const diagramEngineListener = nextProps.diagramEngine.addListener({
        repaintCanvas: () => this.forceUpdate()
      });
      this.setState({ diagramEngineListener });
    }
  }

  componentWillUpdate(nextProps: DiagramProps) {
    if (this.props.diagramEngine.diagramModel.id !== nextProps.diagramEngine.diagramModel.id) {
      this.setState({ renderedNodes: false });
      nextProps.diagramEngine.diagramModel.rendered = true;
    }
    if (!nextProps.diagramEngine.diagramModel.rendered) {
      this.setState({ renderedNodes: false });
      nextProps.diagramEngine.diagramModel.rendered = true;
    }
  }

  componentDidUpdate() {
    if (!this.state.renderedNodes) {
      this.setState({
        renderedNodes: true
      });
    }
  }

  componentDidMount() {
    this.onKeyUpPointer = this.onKeyUp.bind(this);

    // add a keyboard listener
    this.setState({
      document,
      renderedNodes: true,
      diagramEngineListener: this.props.diagramEngine.addListener({
        repaintCanvas: () => {
          this.forceUpdate();
        }
      })
    });

    window.addEventListener('keyup', this.onKeyUpPointer, false);

    // dont focus the window when in test mode - jsdom fails
    if (process.env.NODE_ENV !== 'test') {
      window.focus();
    }
  }

  /**
   * Gets a model and element under the mouse cursor
   */
  getMouseEvent(event: MouseEvent): { model: BaseModel<BaseEntity, BaseModelListener>; element: Element } | null {
    const target = event.target as Element;
    const diagramModel = this.props.diagramEngine.diagramModel;

    // is it a port
    let element = Toolkit.closest(target, '.port[data-name]');
    if (element) {
      const nodeElement = Toolkit.closest(target, '.node[data-nodeid]') as HTMLElement;
      const nodeElId = nodeElement.getAttribute('data-nodeid');
      const portElName = nodeElement.getAttribute('data-name');
      if (nodeElId && portElName) {
        const node = diagramModel.getNode(nodeElId);
        if (node) {
          const port = node.getPort(portElName);
          if (port) {
            return { element, model: port };
          }
        }
      }
    }

    // look for a point
    element = Toolkit.closest(target, '.point[data-id]');
    if (element) {
      const linkId = element.getAttribute('data-linkid');
      const pointId = element.getAttribute('data-id');
      if (linkId && pointId) {
        const link = diagramModel.getLink(linkId);
        if (link) {
          const point = link.getPointModel(pointId);
          if (point) {
            return { element, model: point };
          }
        }
      }
    }

    // look for a link
    element = Toolkit.closest(target, '[data-linkid]');
    if (element) {
      const linkId = element.getAttribute('data-linkid');
      if (linkId) {
        const link = diagramModel.getLink(linkId);
        if (link) {
          return { element, model: link };
        }
      }
    }

    // look for a node
    element = Toolkit.closest(target, '.node[data-nodeid]');
    if (element) {
      const nodeId = element.getAttribute('data-nodeid');
      if (nodeId) {
        const node = diagramModel.getNode(nodeId);
        if (node) {
          return { element, model: node };
        }
      }
    }

    return null;
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
    const diagramEngine = this.props.diagramEngine;
    const diagramModel = diagramEngine.getDiagramModel();
    // select items so draw a bounding box
    if (this.state.action instanceof SelectingAction) {
      const relative = diagramEngine.getRelativePoint(event.clientX, event.clientY);

      _.forEach(diagramModel.getNodes(), (node) => {
        if ((this.state.action as SelectingAction).containsElement(node.x, node.y, diagramModel)) {
          node.setSelected(true);
        }
      });

      _.forEach(diagramModel.getLinks(), (link) => {
        let allSelected = true;
        _.forEach(link.points, (point) => {
          if ((this.state.action as SelectingAction).containsElement(point.x, point.y, diagramModel)) {
            point.setSelected(true);
          } else {
            allSelected = false;
          }
        });

        if (allSelected) {
          link.setSelected(true);
        }
      });

      this.state.action.mouseX2 = relative.x;
      this.state.action.mouseY2 = relative.y;

      this.fireAction();
      this.setState({ action: this.state.action });
      return;
    } else if (this.state.action instanceof MoveItemsAction) {
      const amountX = event.clientX - this.state.action.mouseX;
      const amountY = event.clientY - this.state.action.mouseY;
      const amountZoom = diagramModel.getZoomLevel() / 100;

      _.forEach(this.state.action.selectionModels, (model) => {
        // in this case we need to also work out the relative grid position
        if (
          model.model instanceof NodeModel ||
          (model.model instanceof PointModel && !model.model.isConnectedToPort())
        ) {
          const x = diagramModel.getGridPosition(model.initialX + amountX / amountZoom);
          const y = diagramModel.getGridPosition(model.initialY + amountY / amountZoom);
          model.model.setPosition(x, y);

          // update port coordinates as well
          // if (model.model instanceof NodeModel) {
          // 	_.forEach(model.model.getPorts(), port => {
          // 		const portCoords = this.props.diagramEngine.getPortCoords(port);
          // 		port.updateCoords(portCoords);
          // 	});
          // }

          if (diagramEngine.isSmartRoutingEnabled()) {
            diagramEngine.calculateRoutingMatrix();
          }
        } else if (model.model instanceof PointModel) {
          // we want points that are connected to ports, to not necessarily snap to grid
          // this stuff needs to be pixel perfect, dont touch it
          model.model.x = model.initialX + diagramModel.getGridPosition(amountX / amountZoom);
          model.model.y = model.initialY + diagramModel.getGridPosition(amountY / amountZoom);
        }
      });

      if (diagramEngine.isSmartRoutingEnabled()) {
        diagramEngine.calculateCanvasMatrix();
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
        diagramModel.setOffset(
          this.state.action.initialOffsetX + (event.clientX - this.state.action.mouseX),
          this.state.action.initialOffsetY + (event.clientY - this.state.action.mouseY)
        );
        this.fireAction();
        this.forceUpdate();
      }
    }
  }

  onKeyUp(event: React.KeyboardEvent<HTMLDivElement>) {
    // delete all selected
    if (this.props.deleteKeys!.indexOf(event.keyCode) !== -1) {
      _.forEach(this.props.diagramEngine.getDiagramModel().getSelectedItems(), (element) => {
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
      const element = this.getMouseEvent(event);
      _.forEach(this.state.action.selectionModels, (model) => {
        // only care about points connecting to things
        if (!(model.model instanceof PointModel)) {
          return;
        }
        if (element && element.model instanceof PortModel && !diagramEngine.isModelLocked(element.model)) {
          const link = model.model.getLink();
          if (link.getTargetPort() !== null) {
            // if this was a valid link already and we are adding a node in the middle, create 2 links from the original
            if (link.getTargetPort() !== element.model && link.getSourcePort() !== element.model) {
              const targetPort = link.getTargetPort();
              if (targetPort) {
                const newLink = link.clone({});
                newLink.setSourcePort(element.model);
                newLink.setTargetPort(targetPort);
                link.setTargetPort(element.model);
                targetPort.removeLink(link);
                newLink.removePointsBefore(newLink.getPoints()[link.getPointIndex(model.model)]);
                link.removePointsAfter(model.model);
                diagramEngine.getDiagramModel().addLink(newLink);
              } else {
                // TODO ?? what do we do if targetPort is null
              }
              // if we are connecting to the same target or source, remove tweener points
            } else if (link.getTargetPort() === element.model) {
              link.removePointsAfter(model.model);
            } else if (link.getSourcePort() === element.model) {
              link.removePointsBefore(model.model);
            }
          } else {
            // if we are just clicking on a port, then remove the link
            if (link.getSourcePort() === element.model) {
              link.remove();
            } else {
              link.setTargetPort(element.model);
              diagramEngine.getDiagramModel().connectLink(link);
            }
          }
          delete this.props.diagramEngine.linksThatHaveInitiallyRendered[link.getID()];
        }
      });

      // check for / remove any loose links in any models which have been moved
      if (!this.props.allowLooseLinks && this.state.wasMoved) {
        _.forEach(this.state.action.selectionModels, (model) => {
          // only care about points connecting to things
          if (!(model.model instanceof PointModel)) {
            return;
          }

          const selectedPoint: PointModel = model.model;
          const link: LinkModel = selectedPoint.getLink();
          if (link.getSourcePort() === null || link.getTargetPort() === null) {
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

        const link = model.model.getLink();
        const sourcePort = link.getSourcePort();
        const targetPort = link.getTargetPort();
        if (sourcePort !== null && targetPort !== null) {
          if (!sourcePort.canLinkToPort(targetPort)) {
            // link not allowed
            link.remove();
          } else if (
            _.some(
              _.values(targetPort.getLinks()),
              (l: LinkModel) => l !== link && (l.getSourcePort() === sourcePort || l.getTargetPort() === sourcePort)
            )
          ) {
            // link is a duplicate
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
        className={this.bem('__selector')}
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
    const model = this.props.diagramEngine.diagramModel;

    if (this.props.allowCanvasZoom) {
      event.preventDefault();
      event.stopPropagation();
      const oldZoomFactor = model.getZoomLevel() / 100;
      let scrollDelta = this.props.inverseZoom ? -event.deltaY : event.deltaY;
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
      if (model.getZoomLevel() + scrollDelta > 10) {
        model.setZoomLevel(model.getZoomLevel() + scrollDelta);
      }

      const zoomFactor = model.getZoomLevel() / 100;

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
      const xFactor = (clientX - model.getOffsetX()) / oldZoomFactor / clientWidth;
      const yFactor = (clientY - model.getOffsetY()) / oldZoomFactor / clientHeight;

      model.setOffset(model.getOffsetX() - widthDiff * xFactor, model.getOffsetY() - heightDiff * yFactor);

      this.props.diagramEngine.enableRepaintEntities([]);
      this.forceUpdate();
    }
  }

  onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    this.setState({ ...this.state, wasMoved: false });
    const model = this.props.diagramEngine.getDiagramModel();

    this.props.diagramEngine.clearRepaintEntities();
    const mouseEvent = this.getMouseEvent(event.nativeEvent);
    // the canvas was selected
    if (mouseEvent === null) {
      // is it a multiple selection
      if (event.shiftKey) {
        const { x, y } = this.props.diagramEngine.getRelativePoint(event.clientX, event.clientY);
        this.startFiringAction(new SelectingAction(x, y));
      } else {
        // its a drag the canvas event
        model.clearSelection();
        this.startFiringAction(new MoveCanvasAction(event.clientX, event.clientY, model));
      }
    } else if (mouseEvent.model instanceof PortModel) {
      // its a port element, we want to drag a link
      if (!this.props.diagramEngine.isModelLocked(mouseEvent.model)) {
        const { x, y } = this.props.diagramEngine.getRelativeMousePoint(event);
        const sourcePort = mouseEvent.model;
        const link = sourcePort.createLinkModel();
        if (link) {
          link.setSourcePort(sourcePort);
          link.removeMiddlePoints();
          if (link.getSourcePort() !== sourcePort) {
            link.setSourcePort(sourcePort);
          }
          link.setTargetPort(null);

          link.getFirstPoint().setPosition(x, y);
          link.getLastPoint().setPosition(x, y);

          model.clearSelection();
          link.getLastPoint().setSelected(true);
          model.addLink(link);

          this.startFiringAction(new MoveItemsAction(event.clientX, event.clientY, this.props.diagramEngine));
        }
      } else {
        model.clearSelection();
      }
    } else {
      // its some or other element, probably want to move it
      if (!event.shiftKey && !mouseEvent.model.isSelected()) {
        model.clearSelection();
      }
      mouseEvent.model.setSelected(true);

      this.startFiringAction(new MoveItemsAction(event.clientX, event.clientY, this.props.diagramEngine));
    }
    this.state.document.addEventListener('mousemove', this.onMouseMove);
    this.state.document.addEventListener('mouseup', this.onMouseUp);
  }

  pointAdded(point: PointModel, event: MouseEvent) {
    this.state.document.addEventListener('mousemove', this.onMouseMove);
    this.state.document.addEventListener('mouseup', this.onMouseUp);
    event.stopPropagation();
    this.props.diagramEngine.diagramModel.clearSelection(point);
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
        {...this.getProps()}
        ref={(ref) => {
          if (ref) {
            this.props.diagramEngine.setCanvas(ref);
          }
        }}
        onWheel={this.onWheel}
        onMouseDown={this.onMouseDown}
      >
        {this.state.renderedNodes && (
          <LinkLayerWidget
            diagramEngine={diagramEngine}
            pointAdded={this.pointAdded}
          />
        )}
        <NodeLayerWidget diagramEngine={diagramEngine} />
        {this.state.action instanceof SelectingAction && this.drawSelectionBox()}
      </div>
    );
  }
}
