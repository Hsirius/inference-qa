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
        name:
          '快放假as了多久法拉盛建档立卡福建省砥砺奋进拉我积极fail省经费Lisa减肥俩设计费俩塞进来覅敬爱为减肥了防守打法发生地附近了as放',
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
        rowClassName={() => 'editable-row'}
        rowKey="key"
        dataSource={store.data}
        pagination={false}
        className="custom_table"
        // size="small"
      >
        <Table.Column
          title="与问题匹配线索"
          dataIndex="name"
          width="35%"
          render={text => {
            return text;
          }}
        />
        <Table.Column
          title="线索实体"
          dataIndex="age"
          width="25%"
          render={text => {
            return text;
          }}
        />
        <Table.Column
          title="实体相关情报"
          width="40%"
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
