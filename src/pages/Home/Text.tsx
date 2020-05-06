import { useObserver } from 'mobx-react-lite';
import React, { FC } from 'react';
import styles from './index.module.scss';

interface TextProps {
  text: string;
  keywords: string[];
}

const Text: FC<TextProps> = ({ text, keywords }) => {
  const paragraph = compute(text, keywords).map((item, i) => {
    return (
      <span key={i} className={item.key ? styles.keyword : ''}>
        {text.substring(item.start_pos, item.end_pos)}
      </span>
    );
  });
  return useObserver(() => <div className={styles.text}>{paragraph}</div>);
};

//  [1,3],[5,8]
//  [0,1],[3,4],[5,8 ]
function compute(text: string, arr: string[]) {
  const positionArr: { start_pos: number; end_pos: number; key: boolean }[] = [];
  for (let i = 0; i < arr.length; i += 1) {
    let index = text.indexOf(arr[i]);
    while (index > -1) {
      positionArr.push({
        start_pos: index,
        end_pos: index + arr[i].length,
        key: true,
      });
      index = text.indexOf(arr[i], index + arr[i].length);
    }
  }
  positionArr.sort((a, b) => a.start_pos - b.start_pos);
  return positionArr;
}
export default Text;
