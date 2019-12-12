import React, {
  FC,
  CSSProperties,
  ReactNode,
  useRef,
  useState,
  useEffect,
  useCallback
} from 'react';
import { Icon } from 'antd';
import classNames from '@pansy/classnames';
import { setTransform, isTransform3dSupported } from './utils';

/**
 * 模式
 * vertical:垂直; horizontal:水平;
 * */
export type Mode = 'vertical' | 'horizontal';

interface ScrollableBarProps {
  prefixCls?: string;
  className?: string;
  style?: CSSProperties;
  activeKey?: string;
  mode?: Mode;
  scrollAnimated?: boolean;
  onPrevClick?: (e) => void;
  onNextClick?: (e) => void;
  prevIcon?: ReactNode;
  nextIcon?: ReactNode;
  direction?: 'rtl' | 'ltr'
}

let offset: number = 0;

const ScrollableBar: FC<ScrollableBarProps> = (props) => {
  const {
    prefixCls,
    className,
    style,
    mode,
    prevIcon,
    nextIcon,
    onNextClick,
    onPrevClick,
    direction,
    scrollAnimated
  } = props;

  const navRef = useRef(null);
  const navWrapRef = useRef(null);
  const containerRef = useRef(null);
  const navContainerRef = useRef(null);
  const [next, setNext] = useState<boolean>(false);
  const [prev, setPrev] = useState<boolean>(false);

  useEffect(() => {
    const nextPrev = setNextPrev();
  }, [1])

  const handlePrevClick = (e) => {
    if (!prev) return;
    onPrevClick && onPrevClick(e);

    const navWrapNode = navWrapRef.current;
    const navWrapNodeWH = getOffsetWH(navWrapNode);

    setOffset(offset + navWrapNodeWH);
  }

  const handleNextClick = (e) => {
    if (!next) return;
    onNextClick && onNextClick(e);

    const navWrapNode = navWrapRef.current;
    const navWrapNodeWH = getOffsetWH(navWrapNode);

    setOffset((offset - navWrapNodeWH));
  }

  const getOffsetWH = (node) => {
    let prop = 'offsetWidth';
    if (mode === 'vertical') {
      prop = 'offsetHeight';
    }
    return node[prop];
  }

  const getOffsetLT = (node) => {
    let prop = 'left';
    if (mode === 'vertical') {
      prop = 'top';
    }
    return node.getBoundingClientRect()[prop];
  }

  const getScrollWH = (node) => {
    let prop = 'scrollWidth';
    if (mode === 'vertical') {
      prop = 'scrollHeight';
    }
    return node[prop];
  }

  const setNextPrev = () => {
    const navNode = navRef.current;
    const navWrapNode = navWrapRef.current;
    const containerNode = containerRef.current;
    const navContainerNode = navContainerRef.current;

    const navNodeWH = getScrollWH(navContainerNode || navNode);
    const containerNodeWH = getOffsetWH(containerNode) + 1;
    const navWrapNodeWH = getOffsetWH(navWrapNode);

    const minOffset = containerNodeWH - navNodeWH;

    let [prevCopy, nextCopy] = [prev, next];

    if (minOffset >= 0) {
      nextCopy = false;
      setOffset(0, false);
      offset = 0;
    } else if (minOffset < offset) {
      nextCopy = true;
    } else {
      nextCopy = false;
      const realOffset = navWrapNodeWH - navNodeWH;
      setOffset(realOffset, false);
      offset = realOffset;
    }

    if (offset < 0) {
      prevCopy = true;
    } else {
      prevCopy = false;
    }

    setNext(nextCopy);
    setPrev(prevCopy);

    return {
      next: nextCopy,
      prev: prevCopy
    };
  }

  /**
   *
   * @param offset
   * @param checkNextPrev
   */
  const setOffset = (value: number, checkNextPrev = true) => {
    let target = Math.min(0, value);

    if (offset !== target) {
      offset = target;
      let navOffset: {
        name?: string,
        value?: string
      } = {};

      const navNode = navRef.current;
      const navStyle = navNode.style;

      const transformSupported = isTransform3dSupported(navStyle);

      if (mode === 'vertical') {
        if (transformSupported) {
          navOffset = {
            value: `translate3d(0,${target}px,0)`,
          };
        } else {
          navOffset = {
            name: 'top',
            value: `${target}px`,
          };
        }
      } else if (transformSupported) {
        if (direction === 'rtl') {
          target = -target;
        }
        navOffset = {
          value: `translate3d(${target}px,0,0)`,
        };
      } else {
        navOffset = {
          name: 'left',
          value: `${target}px`,
        };
      }

      if (transformSupported) {
        setTransform(navStyle, navOffset.value);
      } else {
        navStyle[navOffset.name] = navOffset.value;
      }
      if (checkNextPrev) {
        setNextPrev();
      }
    }
  }

  const showNextPrev = prev || next;

  const prevButton = (
    <span
      unselectable="on"
      onClick={handlePrevClick}
      className={classNames({
        [`${prefixCls}-prev`]: 1,
        [`${prefixCls}-btn-disabled`]: !prev,
        [`${prefixCls}-arrow-show`]: showNextPrev,
      })}
    >
      {prevIcon || (
        <span className={`${prefixCls}-prev-icon`} >
          <Icon type="left" />
        </span>
      )}
    </span>
  );

  const nextButton = (
    <span
      onClick={handleNextClick}
      unselectable="on"
      className={classNames({
        [`${prefixCls}-next`]: 1,
        [`${prefixCls}-btn-disabled`]: !next,
        [`${prefixCls}-arrow-show`]: showNextPrev,
      })}
    >
      {nextIcon || (
        <span className={`${prefixCls}-next-icon`}>
          <Icon type="right" />
        </span>
      )}
    </span>
  );

  return (
    <div
      className={classNames(className, {
        [`${prefixCls}`]: true,
        [`${prefixCls}-scrolling`]: showNextPrev
      })}
      style={style}
      ref={containerRef}
    >
      {prevButton}
      {nextButton}
      <div
        className={`${prefixCls}-nav-wrap`}
        ref={navWrapRef}
      >
        <div className={`${prefixCls}-nav-scroll`}>
          <div
            className={classNames(`${prefixCls}-nav`, {
              [`${prefixCls}-nav-animated`]: scrollAnimated
            })}
            ref={navRef}
          >
            <div ref={navContainerRef}>
              <span>
                1234555
              </span>
              <span>
                1234555
              </span>
              <span>
                1234555
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

ScrollableBar.defaultProps = {
  prefixCls: 'ant-plus-scrollable-bar',
  mode: 'horizontal',
  scrollAnimated: true
}

export default ScrollableBar;
