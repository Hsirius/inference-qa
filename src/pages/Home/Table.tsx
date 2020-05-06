import { Table } from 'antd';
import { useLocalStore, useObserver } from 'mobx-react-lite';
import React from 'react';
import styles from './index.module.scss';

interface TextProps {
  text: string;
  keywords: string[];
}

const Tables = () => {
  const store = useLocalStore(() => ({
    data: [
      {
        key: '1',
        name: '胡彦斌',
        age: 32,
        address: '西湖区湖底公园1号',
      },
      {
        key: '2',
        name: '胡彦祖',
        age: 42,
        address: '西湖区湖底公园1号',
      },
    ],
  }));
  return useObserver(() => (
    <div className={styles.table}>
      <Table
        // rowClassName={() => 'editable-row'}
        rowKey="key"
        dataSource={store.data}
        pagination={false}
        bordered
        // onHeaderRow={() => {
        // }}
        // size="small"
      >
        <Table.Column
          title="名称"
          dataIndex="name"
          render={text => {
            return text;
          }}
        />
        <Table.Column
          title="名称"
          dataIndex="age"
          render={text => {
            return text;
          }}
        />
        <Table.Column
          title="名称"
          dataIndex="address"
          render={text => {
            return text;
          }}
        />
      </Table>
    </div>
  ));
};

export default Tables;
