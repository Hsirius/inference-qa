import React, { useEffect } from 'react';
import G6 from '@antv/g6';
import { useLocalStore, useObserver } from 'mobx-react-lite';
import { Button } from 'antd';

const Draggable = () => {
  const store = useLocalStore(() => ({
    data: {
      nodes: [
        { id: 'node0', size: 50, label: '数据0' },
        { id: 'node1', size: 30, label: '1' },
        { id: 'node2', size: 30, label: '2' },
        { id: 'node3', size: 30, label: '3' },
        { id: 'node4', size: 30, isLeaf: true, label: '4' },
        { id: 'node5', size: 30, isLeaf: true, label: '5' },
        { id: 'node6', size: 15, isLeaf: true, label: '6' },
        { id: 'node7', size: 15, isLeaf: true, label: '7' },
        { id: 'node8', size: 15, isLeaf: true, label: '8' },
        { id: 'node9', size: 15, isLeaf: true, label: '9' },
        { id: 'node10', size: 15, isLeaf: true, label: '数据0' },
        { id: 'node11', size: 15, isLeaf: true, label: '数据0' },
        { id: 'node12', size: 15, isLeaf: true, label: '数据0' },
        { id: 'node13', size: 15, isLeaf: true, label: '数据0' },
        { id: 'node14', size: 15, isLeaf: true, label: '数据0' },
        { id: 'node15', size: 15, isLeaf: true, label: '数据0' },
        { id: 'node16', size: 15, isLeaf: true, label: '数据0' },
      ],
      edges: [
        { source: 'node0', target: 'node1' },
        { source: 'node0', target: 'node2' },
        { source: 'node0', target: 'node3' },
        { source: 'node0', target: 'node4' },
        { source: 'node0', target: 'node5' },
        { source: 'node1', target: 'node6' },
        { source: 'node1', target: 'node7' },
        { source: 'node2', target: 'node8' },
        { source: 'node2', target: 'node9' },
        { source: 'node2', target: 'node10' },
        { source: 'node2', target: 'node11' },
        { source: 'node2', target: 'node12' },
        { source: 'node2', target: 'node13' },
        { source: 'node3', target: 'node14' },
        { source: 'node3', target: 'node15' },
        { source: 'node3', target: 'node16' },
      ],
    },
    initChart: () => {
      const graph = new G6.Graph({
        container: 'mountNode',
        width: 1200,
        height: 500,
        layout: {
          type: 'force',
          preventOverlap: true,
          linkDistance: (d: any) => {
            console.log(d);
            if (d.source.id === 'node0') {
              return 100;
            }
            return 30;
          },
          nodeStrength: (d: any) => {
            if (d.isLeaf) {
              return -50;
            }
            return -10;
          },
          edgeStrength: (d: any) => {
            if (d.source.id === 'node1' || d.source.id === 'node2' || d.source.id === 'node3') {
              return 0.7;
            }
            return 0.1;
          },
        },
        defaultNode: {
          color: '#5B8FF9',
          style: {
            lineWidth: 2,
            fill: '#C6E5FF',
          },
        },
        defaultEdge: {
          size: 1,
          color: '#e2e2e2',
        },
      });
      const nodes = store.data.nodes;
      graph.data({
        nodes,
        edges: store.data.edges.map((edge: any, i) => {
          edge.id = 'edge' + i;
          return Object.assign({}, edge);
        }),
      });
      graph.render();

      graph.on('node:dragstart', function(e: any) {
        graph.layout();
        store.refreshDragedNodePosition(e);
      });
      graph.on('node:drag', function(e: any) {
        store.refreshDragedNodePosition(e);
      });
      graph.on('node:dragend', function(e: any) {
        e.item.get('model').fx = null;
        e.item.get('model').fy = null;
      });
    },
    refreshDragedNodePosition: (e: any) => {
      const model = e.item.get('model');
      model.fx = e.x;
      model.fy = e.y;
    },
  }));
  useEffect(() => {
    store.initChart();
  }, []);
  return useObserver(() => (
    <div id="mountNode">
      <Button type="primary" shape="round">
        知识库
      </Button>
    </div>
  ));
};

export default Draggable;
