import * as React from 'react';
import * as cx from 'classnames';
import { action } from 'mobx';
import { observer } from 'mobx-react';

import { DiagramEngine } from '../DiagramEngine';
import { LinkLayerWidget } from './layers/LinkLayerWidget';
import { NodeLayerWidget } from './layers/NodeLayerWidget';
import { SelectionBox } from './SelectionBox';
import { Toolkit } from '../Toolkit';
import { BaseAction } from '../actions/BaseAction';
import { MoveCanvasAction } from '../actions/MoveCanvasAction';
import { MoveItemsAction } from '../actions/MoveItemsAction';
import { SelectingAction } from '../actions/SelectingAction';
import { APortModel } from '../models/abstract/APortModel';
import { ALinkModel } from '../models/abstract/ALinkModel';
import { BaseModel } from '../models/BaseModel';
import { CreateLinkAction } from '../actions/CreateLinkAction';

export interface DiagramProps {
  engine: DiagramEngine;

  actionStartedFiring?: (action: BaseAction) => boolean;
  actionStillFiring?: (action: BaseAction) => void;
  actionStoppedFiring?: (action: BaseAction) => void;
}

@observer
export class DiagramWidget extends React.Component<DiagramProps & React.HTMLProps<HTMLDivElement>> {

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
  getModelAtPosition(event: MouseEvent): { el: Element; model: BaseModel<any> | undefined } {
    const target = event.target as Element;
    const model = this.props.engine.model;

    // look for a port
    let element = Toolkit.closest(target, '.srd-port[srd-id]');
    if (element) {
      const nodeElement = Toolkit.closest(target, '.srd-node[srd-id]');
      const nodeId = nodeElement.getAttribute('srd-id');
      const portId = element.getAttribute('srd-id');
      if (nodeId && portId) {
        const node = model.nodesMap.get(nodeId);
        if (node) {
          const port = node.portsMap.get(portId);
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
        const link = model.linksMap.get(linkId);
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
        const link = model.linksMap.get(linkId);
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
        const node = model.nodesMap.get(nodeId);
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

  startFiringAction(a: BaseAction) {
    let allowedAction = true;
    if (this.props.actionStartedFiring) {
      allowedAction = this.props.actionStartedFiring(a);
    }
    if (allowedAction) {
      this.props.engine.action = a;
    }
  }

  @action.bound
  onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    const { el, model } = this.getModelAtPosition(event.nativeEvent);
    if (model) {
      if (model instanceof APortModel) {
        // its a port element, we want to create a link
        if (!this.props.engine.model.locked && !model.locked) {
          const link = this.props.engine
            .getPortFactory(model.type)
            .getLinkFactory()
            .getNewInstance();
          // define link source to be the current clicked port
          link.sourcePort = model;
          // create a point on the link to track mouse position
          const lastPoint = this.props.engine
            .getLinkFactory(link.type)
            .getPointFactory()
            .getNewInstance({ x: event.clientX, y: event.clientY });
          link.addPoint(lastPoint);
          // unselect all
          this.props.engine.model.clearSelection();
          // select link & last point
          link.selected = true;
          lastPoint.selected = true;
          this.props.engine.model.addLink(link);
          this.startFiringAction(new CreateLinkAction(event.clientX, event.clientY, link));
        }
      } else if (model instanceof ALinkModel) {
        // we want to create a point
        if (!this.props.engine.model.locked && !model.locked) {
          if (event.shiftKey) {
            // we want to select the link
            model.selected = true;
          } else {
            // we want to add a point to a link: be sure we can still add point
            if (this.props.engine.model.maxNumberPointsPerLink > model.points.length) {
              const { x, y } = this.props.engine.getRelativeMousePoint(event);
              const point = this.props.engine
                .getLinkFactory(model.type)
                .getPointFactory()
                .getNewInstance({ x, y });
              this.props.engine.model.clearSelection();
              point.selected = true;
              // retrieve clicked .srd-segment in order to position point properly
              let segmentIndex: number = 0;
              const segEl = Toolkit.closest(el, '.srd-segment');
              if (segEl) {
                const indexAttr = segEl.getAttribute('srd-index');
                if (indexAttr) {
                  segmentIndex = parseInt(indexAttr, 10);
                }
              }
              // point should be placed at index = segmentIndex + 1
              model.addPoint(point, segmentIndex + 1);
              const a = new MoveItemsAction(event.clientX, event.clientY, this.props.engine);
              this.startFiringAction(a);
            } else {
              // if we cannot create more modelpoints, then just select the link
              model.selected = true;
            }
          }
        }
      } else {
        // mousedown on an element (not a port nor a link): probably wants to move it
        if (!event.shiftKey && !model.selected) {
          this.props.engine.model.clearSelection();
        }

        if (!model.selected) {
          model.selected = true;
        }
        const a = new MoveItemsAction(event.clientX, event.clientY, this.props.engine);
        this.startFiringAction(a);
      }
    } else {
      // no selection: the canvas was selected
      if (event.shiftKey) {
        // it is a "multiple selection" action
        const { x, y } = this.props.engine.getPointRelativeToCanvas(event.clientX, event.clientY);
        this.startFiringAction(new SelectingAction(x, y));
      } else {
        // it is a "move the canvas" action
        this.startFiringAction(new MoveCanvasAction(event.clientX, event.clientY, this.props.engine.model));
      }
    }

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  @action.bound
  onMouseMove(event: MouseEvent) {
    event.preventDefault();
    const model = this.props.engine.model;
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

      const relative = this.props.engine.getPointRelativeToCanvas(event.clientX, event.clientY);
      this.props.engine.action.mouseX2 = relative.x;
      this.props.engine.action.mouseY2 = relative.y;

      this.fireAction();
    } else if (this.props.engine.action instanceof CreateLinkAction) {
      const { x, y } = this.props.engine.getRelativeMousePoint(event);
      // update point to track mouse position
      this.props.engine.action.link.points[0].setPosition(x, y);
      this.fireAction();
    } else if (this.props.engine.action instanceof MoveItemsAction) {
      const xOffset = event.clientX - this.props.engine.action.mouseX;
      const yOffset = event.clientY - this.props.engine.action.mouseY;
      const zoomRatio = model.zoom / 100;
      this.props.engine.action.selectionModels.forEach((selection) => {
        // in this case we need to also work out the relative grid position
        selection.model.setPosition(
          selection.initialX + xOffset / zoomRatio,
          selection.initialY + yOffset / zoomRatio
        );
      });

      if (this.props.engine.model.smartRouting) {
        this.props.engine.calculateCanvasMatrix();
      }

      this.fireAction();
    } else if (this.props.engine.action instanceof MoveCanvasAction) {
      // translate the actual canvas
      if (this.props.engine.model.allowCanvasTranslation) {
        model.offsetX = this.props.engine.action.initialOffsetX + (event.clientX - this.props.engine.action.mouseX);
        model.offsetY = this.props.engine.action.initialOffsetY + (event.clientY - this.props.engine.action.mouseY);
        this.fireAction();
      }
    }
  }

  @action.bound
  onMouseUp(event: MouseEvent) {
    event.preventDefault();
    if (this.props.engine.action instanceof CreateLinkAction) {
      const link = this.props.engine.action.link;
      const { model } = this.getModelAtPosition(event);
      if (model) {
        if (!model.locked && !this.props.engine.model.locked) {
          if (model instanceof APortModel) {
            // prevent sourcePort === targetPort
            if (link.sourcePort !== model) {
              // check if link can connect to that port
              if (link.sourcePort!.canLinkToPort(model)) {
                // link is now connected from end-to-end
                link.targetPort = model;
                link.removeAllPoints();
                this.props.engine.model.clearSelection();
              } else {
                // invalid link connection
                link.delete();
                this.props.engine.model.clearSelection();
              }
            } else {
              // link.sourcePort === targetPort which is not allowed
              link.delete();
              this.props.engine.model.clearSelection();
            }
          } else {
            // link has been dropped on something that is not a PortModel
            // so it will dangel: verify
            if (!this.props.engine.model.allowLooseLinks) {
              link.delete();
              this.props.engine.model.clearSelection();
            }
          }
        } else {
          // element or model is locked: remove link
          link.delete();
          this.props.engine.model.clearSelection();
        }
      } else {
        // no element where link ended
        if (!this.props.engine.model.allowLooseLinks) {
          link.delete();
          this.props.engine.model.clearSelection();
        }
      }
    } else if (this.props.engine.action instanceof MoveCanvasAction) {
      const { mouseX, mouseY } = this.props.engine.action;
      if (mouseX === event.clientX && mouseY === event.clientY) {
        // the user just "clicked" the canvas without moving: unselect all
        this.props.engine.model.clearSelection();
      }
    }

    this.stopFiringAction();
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  @action.bound
  onKeyUp(event: KeyboardEvent) {
    event.preventDefault();
    // delete all selected
    if (this.props.engine.model.deleteKeys.indexOf(event.keyCode) !== -1) {
      // only delete items if model is not locked
      if (!this.props.engine.model.locked) {
        this.props.engine.model.selectedEntities.forEach((element) => {
          // only delete items which are not locked
          if (!element.locked) {
            element.delete();
          }
        });
      }
    }
  }

  @action.bound
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
    return (
      <div
        className={cx('srd-diagram', this.props.className)}
        style={this.props.style}
        ref={(ref) => (this.props.engine.canvas = ref)}
        onWheel={this.onWheel}
        onMouseDown={this.onMouseDown}
      >
        <NodeLayerWidget engine={this.props.engine} />
        <LinkLayerWidget engine={this.props.engine} />
        <SelectionBox engine={this.props.engine} />
      </div>
    );
  }
}
