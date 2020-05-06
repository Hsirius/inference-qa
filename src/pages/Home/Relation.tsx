import G6 from '@antv/g6';
import { useObserver } from 'mobx-react-lite';
import React, { useEffect } from 'react';

type STATUS = 'I' | 'C' | 'S';

interface ListItem {
  id: string;
  label?: string;
  status: STATUS; // 状态
  childList?: ListItem[];
}

export interface IProps {
  data?: ListItem[];
  config?: any;
  onInit?: (instance: any) => void;
  nodeClick?: (nodeItem: ListItem) => void;
}

interface GraphData {
  nodes: object[];
  edges: object[];
}

// 模拟数据
const mockData: ListItem[] = [
  {
    id: 'g1',
    label: '金正恩',
    status: 'S',
    childList: [
      {
        id: 'g12',
        label: '平壤',
        status: 'S',
        childList: [
          {
            id: 'g121',
            label: '朝鲜劳动党委员长，国务委员会委员长金正恩11月3日下午',
            status: 'S',
            childList: [],
          },
          {
            id: 'g122',
            label: 'xx元',
            status: 'S',
            childList: [
              {
                id: 'g1221',
                label: 'xx元',
                status: 'S',
                childList: [],
              },
              {
                id: 'g1222',
                label: 'xx元',
                status: 'S',
                childList: [],
              },
            ],
          },
          {
            id: 'g123',
            label: 'xx元',
            status: 'S',
            childList: [
              {
                id: 'g1231',
                label: 'xx元',
                status: 'I',
                childList: [],
              },
            ],
          },
        ],
      },
      {
        id: 'g13',
        label: '米格尔-迪亚斯',
        status: 'S',
        childList: [
          {
            id: 'g131',
            label: 'xx',
            status: 'I',
            childList: [],
          },
          {
            id: 'g132',
            label: 'xx元',
            status: 'I',
            childList: [],
          },
        ],
      },
      {
        id: 'g14',
        label: '平安南道阳德郡温泉旅游区',
        status: 'I',
        childList: [],
      },
    ],
  },
];

//  组件props
const props: IProps = {
  data: mockData,
  config: {
    padding: [20, 50],
    defaultLevel: 3,
    defaultZoom: 0.8,
    modes: { default: ['zoom-canvas', 'drag-canvas'] },
  },
  nodeClick: (item: any) => {
    console.log(item);
  },
};

// 默认配置
const defaultConfig = {
  width: 1100,
  height: 800,
  pixelRatio: 1,
  modes: {
    default: ['zoom-canvas', 'drag-canvas'],
  },
  fitView: false,
  animate: true,
  defaultEdge: {
    style: {
      stroke: '#1890FF',
    },
  },
};

// number to string
const toString = (id: number) => id + '';

/**
 * sleep
 * @param {duration} number unit ms
 */
const sleep = (duration = 500) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('done');
    }, duration);
  });
};

// 自定义节点、边
const registerFn = () => {
  /**
   * 自定义节点
   */
  G6.registerNode(
    'flow-rect',
    {
      shapeType: 'flow-rect',
      draw(cfg: any, group: any) {
        const { lightColor, hasChildren, label, collapsed } = cfg;
        // 逻辑不应该在这里判断
        const rectConfig = {
          width: 184,
          height: 74,
          lineWidth: 1,
          fontSize: 12,
          fill: '#fff',
          radius: 4,
          stroke: lightColor,
          opacity: 1,
        };

        const textConfig = {
          textAlign: 'left',
          textBaseline: 'top',
        };

        const rect = group.addShape('rect', {
          attrs: {
            x: 0,
            y: 0,
            ...rectConfig,
          },
        });

        // label count
        group.addShape('text', {
          attrs: {
            ...textConfig,
            x: 12,
            y: 20,
            text: label,
            fontSize: 20,
            fill: '#000',
          },
        });

        if (hasChildren) {
          // collapse circle
          group.addShape('circle', {
            attrs: {
              x: rectConfig.width,
              y: rectConfig.height / 2,
              r: 8,
              stroke: lightColor,
              fill: collapsed ? lightColor : '#fff',
              isCollapseShape: true,
            },
          });

          // collpase text
          group.addShape('text', {
            attrs: {
              x: rectConfig.width,
              y: rectConfig.height / 2,
              width: 16,
              height: 16,
              textAlign: 'center',
              textBaseline: 'middle',
              text: collapsed ? '+' : '-',
              fontSize: 16,
              fill: collapsed ? '#fff' : lightColor,
              cursor: 'pointer',
              isCollapseShape: true,
            },
          });
        }

        this.drawLinkPoints(cfg, group);
        return rect;
      },
      update(cfg: any, item: any) {
        const group = item.getContainer();
        this.updateLinkPoints(cfg, group);
      },
      setState(name: any, value: any, item: any) {
        if (name === 'click' && value) {
          const group = item.getContainer();
          const { collapsed } = item.getModel();
          const [, , , , , , CircleShape, TextShape] = group.get('children');
          if (TextShape) {
            const {
              attrs: { stroke },
            } = CircleShape;
            if (!collapsed) {
              TextShape.attr({
                text: '-',
                fill: stroke,
              });
              CircleShape.attr({
                fill: '#fff',
              });
            } else {
              TextShape.attr({
                text: '+',
                fill: '#fff',
              });
              CircleShape.attr({
                fill: stroke,
              });
            }
          }
        }
      },
      getAnchorPoints() {
        return [
          [0, 0.5],
          [1, 0.5],
        ];
      },
    },
    // 注意这里继承了 'single-shape'
    'rect',
  );

  G6.registerEdge(
    'flow-cubic',
    {
      getControlPoints(cfg: any) {
        let controlPoints = cfg.controlPoints; // 指定controlPoints
        if (!controlPoints || !controlPoints.length) {
          const { startPoint, endPoint, sourceNode, targetNode } = cfg;
          const { x: startX, y: startY, coefficientX, coefficientY } = sourceNode
            ? sourceNode.getModel()
            : startPoint;
          const { x: endX, y: endY } = targetNode ? targetNode.getModel() : endPoint;
          let curveStart = (endX - startX) * coefficientX;
          let curveEnd = (endY - startY) * coefficientY;
          curveStart = curveStart > 40 ? 40 : curveStart;
          curveEnd = curveEnd < -30 ? curveEnd : -30;
          controlPoints = [
            { x: startPoint.x + curveStart, y: startPoint.y },
            { x: endPoint.x + curveEnd, y: endPoint.y },
          ];
        }
        return controlPoints;
      },
      getPath(points: any) {
        const path = [];
        path.push(['M', points[0].x, points[0].y]);
        path.push([
          'C',
          points[1].x,
          points[1].y,
          points[2].x,
          points[2].y,
          points[3].x,
          points[3].y,
        ]);
        return path;
      },
    },
    'single-line',
  );
};

registerFn();

const { data } = props;
let backUpData: any;
let maxMatrixY = 0;
let isAnimating = false;
let graph: any = null;

const initGraph = (data?: ListItem[]) => {
  if (!data?.length) {
    return;
  }
  transformData(data);
  const { onInit, config } = props;
  graph = new G6.Graph({
    container: 'relation',
    ...defaultConfig,
    ...config,
  });
  initEvent();
  if (typeof onInit === 'function') {
    onInit(graph);
  }
  backUpData = JSON.parse(JSON.stringify(data));
  graph.data(getPosition(data, true));
  graph.render();
  graph.zoom(config.defaultZoom || 1);
  if (data?.length) {
    graph.changeData(getPosition(backUpData));
  }
};

// 事件绑定
const initEvent = () => {
  graph.on('node:click', async (evt: any) => {
    if (isAnimating) {
      return;
    }
    const { item, target } = evt;
    const {
      attrs: { isCollapseShape },
    } = target;
    if (isCollapseShape) {
      isAnimating = true;
      const model = item.getModel();
      graph.setItemState(item, 'click', true);
      const { childrenKeys, id, collapsed, recordIndex } = model;
      // 更新状态
      if (collapsed) {
        updateCollapseStatus(id, recordIndex, collapsed, 'expand');
        graph.changeData(getExpandPosition(backUpData));
        graph.stopAnimate();
        childrenKeys.forEach(async (key: string) => {
          const childrenItem = graph.findById(key);
          if (childrenItem) {
            childrenItem.toBack();
          }
        });
        updateCollapseStatus(id, recordIndex, collapsed);
        graph.changeData(getPosition(backUpData));
        await sleep(500);
        graph.setItemState(item, 'click', false);
        isAnimating = false;
      } else {
        updateCollapseStatus(id, recordIndex, collapsed, 'collapsed');
        graph.changeData(getPosition(backUpData));
        childrenKeys.forEach(async (key: string) => {
          const childrenItem = graph.findById(key);
          if (childrenItem) {
            childrenItem.toBack();
          }
        });
        await sleep(500);
        updateCollapseStatus(id, recordIndex, collapsed);
        childrenKeys.forEach(async (key: string) => {
          const childrenItem = graph.findById(key);
          if (childrenItem) {
            graph.remove(childrenItem);
          }
        });
        graph.setItemState(item, 'click', false);
        isAnimating = false;
      }
    } else {
      const { nodeClick } = props;
      if (typeof nodeClick === 'function') {
        nodeClick(item.getModel());
      }
    }
  });

  graph.on('node:mouseenter', (evt: any) => {
    const node = evt.item;
    graph.setItemState(node, 'hover', true);
    graph.updateItem(node, {
      style: {
        ...node._cfg.originStyle,
        shadowColor: '#bbb',
        shadowBlur: 6,
      },
    });
  });

  graph.on('node:mousemove', (evt: any) => {
    if (isAnimating) {
      return;
    }
    const { item, target, x, y } = evt;
    const {
      attrs: { isTitleShape },
    } = target;
    const model = item.getModel();
    const { name, id } = model;
    if (isTitleShape) {
      const postion = graph.getClientByPoint(x, y);
      createTooltip(postion, name, id);
    } else {
      removeTooltip(id);
    }
  });

  graph.on('node:mouseout', (evt: any) => {
    if (isAnimating) {
      return;
    }
    const { item, target } = evt;
    const {
      attrs: { isTitleShape },
    } = target;
    const model = item.getModel();
    const { id } = model;
    if (isTitleShape) {
      removeTooltip(id);
    }
  });

  graph.on('node:mouseleave', (evt: any) => {
    const node = evt.item;
    graph.setItemState(node, 'hover', false);
    graph.updateItem(node, {
      style: {
        ...node._cfg.originStyle,
        shadowColor: 'transparent',
        shadowBlur: 0,
      },
    });
  });
};

/**
 * 创建提示
 * @param {postion} 鼠标点击的位置
 * @param {name} string 节点名称
 * @param {id} string 节点id
 */
const createTooltip = (postion: { x: number; y: number }, name: string, id: string) => {
  const offsetTop = -60;
  const existTooltip = document.getElementById(id);
  const x = postion.x + 'px';
  const y = postion.y + offsetTop + 'px';
  if (existTooltip) {
    existTooltip.style.left = x;
    existTooltip.style.top = y;
  } else {
    // content
    const tooltip = document.createElement('div');
    const span = document.createElement('span');
    span.textContent = name;
    tooltip.style.padding = '10px';
    tooltip.style.background = 'rgba(0,0,0, 0.65)';
    tooltip.style.color = '#fff';
    tooltip.style.borderRadius = '4px';
    tooltip.appendChild(span);
    // box
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.zIndex = '99';
    div.id = id;
    div.style.left = x;
    div.style.top = y;
    div.appendChild(tooltip);
    document.body.appendChild(div);
  }
};
/**
 * 删除提示
 * @param {id} string
 */
const removeTooltip = (id: string) => {
  const removeNode = document.getElementById(id);
  if (removeNode) {
    document.body.removeChild(removeNode);
  }
};

/**
 * 计算位置
 * @param {data} Array<Item>
 * @param {flag} string[] | string
 * @param {postion} object
 */
const getPosition = (data: ListItem[] | undefined, init?: boolean) => {
  maxMatrixY = 0;
  const graphData = {
    nodes: [],
    edges: [],
  };

  if (!data) {
    return graphData;
  }

  if (init) {
    initAnimateData(data, graphData);
  } else {
    recursion(data, 0, graphData);
  }

  return graphData;
};

/**
 * 计算位置
 * @param {data} Array<Item>
 * @param {flag} string[] | string
 * @param {postion} object
 */
const getExpandPosition = (data: ListItem[] | undefined) => {
  maxMatrixY = 0;
  const graphData = {
    nodes: [],
    edges: [],
  };

  if (!data) {
    return graphData;
  }

  recursionExpand(data, 0, graphData);

  return graphData;
};

/**
 * 展开时的特殊处理
 */
const recursionExpand = (
  data: any[],
  parentMatrixX: number,
  graphData: GraphData,
  parentX?: number,
  parentY?: number,
  parentAnimate?: string,
): void => {
  if (!data || !data.length) {
    return;
  }
  data.forEach((item, index) => {
    const matrixX = parentMatrixX || 0;
    const children = _.get(item, 'childList', []);
    const animate = _.get(item, 'animate', false);
    const afterDrawHidden = _.get(item, 'afterDrawHidden', false);
    const collapsed = _.get(item, 'collapsed');
    const currentX = parentAnimate === 'expand' ? parentX : item.x;
    const currentY = parentAnimate === 'expand' ? parentY : item.y;

    item = {
      ...item,
      id: toString(item.id),
      x: currentX,
      y: currentY,
      hasChildren: children.length,
    };
    data[index] = item;
    const { childList, ...model } = item;
    graphData.nodes.push(model);

    if ((children.length && animate) || (children.length && !collapsed)) {
      recursionExpand(
        children,
        afterDrawHidden ? matrixX : matrixX + 1,
        graphData,
        currentX,
        currentY,
        animate,
      );
    }
  });
};

/**
 * 数据转换，生成图表数据
 */
const transformData = (data: any[], parentIndex?: string): void => {
  if (!data || !data.length) {
    return;
  }
  const {
    config: { defaultLevel = 10, padding = [20, 20] },
  } = props;
  data.forEach((item, index) => {
    const children = _.get(item, 'childList', []);
    const recordIndex = parentIndex !== undefined ? parentIndex + '-' + index : index + '';
    maxMatrixY = index === 0 ? maxMatrixY : maxMatrixY + 1;
    const recordLength = recordIndex.split('-').length;
    const childrenKeys: string[] = [];
    if (children.length) {
      getKeys(children, childrenKeys);
    }
    let lightColor: string = '#1890FF';
    item = {
      ...item,
      lightColor,
      id: toString(item.id),
      x: padding[0],
      y: padding[1],
      recordIndex,
      collapsed: recordLength >= defaultLevel,
      hasChildren: children.length,
      childrenKeys,
    };
    data[index] = item;
    if (children.length) {
      transformData(_.get(item, 'childList', []), recordIndex);
    }
  });
};

/**
 * 生成初始化数据，为了动画而动画
 */
const initAnimateData = (data: any[], graphData: GraphData): void => {
  if (!data || !data.length) {
    return;
  }
  data.forEach(item => {
    const children = _.get(item, 'childList', []);
    const collapsed = _.get(item, 'collapsed');
    const { childList, ...model } = item;
    graphData.nodes.push(model);
    if (children.length && !collapsed) {
      initAnimateData(_.get(item, 'childList', []), graphData);
    }
  });
};

/**
 * 递归
 */
const recursion = (
  data: any[],
  parentMatrixX: number,
  graphData: GraphData,
  parentId?: string,
  parentX?: number,
  parentY?: number,
  parentAnimate?: string,
): void => {
  if (!data || !data.length) {
    return;
  }
  const {
    config: { padding = [20, 20], nodesMargin = [250, 100], coefficient = [0.2, -0.1] },
  } = props;
  data.forEach((item, index) => {
    const matrixX = parentMatrixX || 0;
    const children = _.get(item, 'childList', []);
    const animate = _.get(item, 'animate', false);
    const afterDrawHidden = _.get(item, 'afterDrawHidden', false);
    const collapsed = _.get(item, 'collapsed');
    maxMatrixY = index === 0 || afterDrawHidden ? maxMatrixY : maxMatrixY + 1;

    const currentX =
      afterDrawHidden || parentAnimate === 'expand'
        ? parentX
        : matrixX * nodesMargin[0] + padding[0];
    const currentY =
      afterDrawHidden || parentAnimate === 'expand'
        ? parentY
        : maxMatrixY * nodesMargin[1] + padding[1];

    item = {
      ...item,
      id: toString(item.id),
      matrixX,
      matrixY: maxMatrixY,
      x: currentX,
      y: currentY,
      type: 'flow-rect',
      coefficientX: coefficient[0],
      coefficientY: coefficient[1],
      hasChildren: children.length,
      collapsed: item.collapsed || false,
    };
    data[index] = item;
    const { childList, ...model } = item;
    graphData.nodes.push(model);

    if (parentId) {
      graphData.edges.push({
        source: parentId,
        target: toString(item.id),
        targetAnchor: 0,
        sourceAnchor: 1,
        type: index === 0 ? 'line' : 'flow-cubic',
      });
    }

    if ((children.length && animate) || (children.length && !collapsed)) {
      recursion(
        children,
        afterDrawHidden ? matrixX : matrixX + 1,
        graphData,
        toString(item.id),
        currentX,
        currentY,
        animate,
      );
    }
  });
};

/**
 * 获取keys, 折叠、展开时直接使用
 * @param {data} ListItem
 * @param {keys} string[]
 */
const getKeys = (data: ListItem[], keys: string[]): void => {
  if (!data || !data.length) {
    return;
  }
  data.forEach(item => {
    const { id } = item;
    const children = _.get(item, 'childList', []);
    keys.push(id);
    if (children.length) {
      getKeys(children, keys);
    }
  });
};

/**
 * 更新当前数据的collapse状态以及子节点的afterDrawHidden状态
 * @param {id} string
 * @param {recordIndex} string 节点索引
 * @param {collapsed} boolean
 */
const updateCollapseStatus = (
  id: string,
  recordIndex: string,
  collapsed: boolean,
  animate?: string,
): void => {
  let currentList: any = backUpData;
  try {
    let currentRecord: any;
    const indexs = recordIndex.split('-');
    for (let i = 0; i < indexs.length; i += 1) {
      currentRecord = currentList[indexs[i]];
      currentList = currentList[indexs[i]].childList;
    }
    currentRecord.collapsed = !collapsed;
    currentRecord.animate = animate;

    const setHidden = (data: any[]) => {
      if (!data || !data.length) {
        return;
      }
      data.forEach((item, index) => {
        const children = _.get(item, 'childList', []);
        data[index] = {
          ...item,
          afterDrawHidden: !collapsed,
        };
        if (children.length && !item.collapsed) {
          setHidden(children);
        }
      });
    };
    setHidden(currentList);
  } catch (err) {
    console.error(err, id, currentList);
  }
};

const Relation = () => {
  useEffect(() => {
    initGraph(data);
  }, []);
  return useObserver(() => <div id="relation"></div>);
};
export default Relation;
