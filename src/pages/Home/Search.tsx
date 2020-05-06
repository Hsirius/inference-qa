import { Button, Input, Tag } from 'antd';
import { useLocalStore, useObserver } from 'mobx-react-lite';
import React, { FC } from 'react';
import { AudioOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

const { Search } = Input;
const { CheckableTag } = Tag;

interface SearchsProps {
  onChange?: (val: string) => void;
}
const Searchs: FC<SearchsProps> = ({ onChange }) => {
  const store = useLocalStore(() => ({
    checked: 1,
    text: '',
    handleChange: (index: number) => {
      store.checked = index;
    },
  }));
  return useObserver(() => (
    <div className={styles.content}>
      <p>军事问答</p>
      <div className={styles.tip}>
        <CheckableTag checked={store.checked === 1} onChange={() => store.handleChange(1)}>
          全部
        </CheckableTag>
        <CheckableTag checked={store.checked === 2} onChange={() => store.handleChange(2)}>
          知识库
        </CheckableTag>
        <CheckableTag checked={store.checked === 3} onChange={() => store.handleChange(3)}>
          阅读理解
        </CheckableTag>
      </div>
      <Search
        placeholder="输入信息..."
        enterButton={
          <Button style={{ background: '#e48800', padding: '0 24px', color: '#fff' }}>搜索</Button>
        }
        size="large"
        suffix={<AudioOutlined />}
        onSearch={onChange}
      />
    </div>
  ));
};

export default Searchs;
