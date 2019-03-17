// tslint:disable-next-line: no-implicit-dependencies
import * as React from 'react';
// tslint:disable-next-line: no-implicit-dependencies
import { Text } from 'react-native';

interface ITimerCountdownProps {
  initialMilliseconds: number;
  formatMilliseconds?: (milliseconds: number) => string;
  onTick?: (milliseconds: number) => void;
  onExpire?: () => void;
  allowFontScaling?: boolean;
  style?: object;
}

export default class TimerCountdown extends React.Component<ITimerCountdownProps> {
  public readonly state = {
    millisecondsRemaining: this.props.initialMilliseconds,
    timeoutId: undefined,
    previousMilliseconds: undefined
  };

  public componentDidMount(): void {
    this.tick();
  }

  public componentWillReceiveProps(newProps): void {
    if (this.state.timeoutId !== undefined) {
      clearTimeout(this.state.timeoutId);
    }
    this.setState({
      previousMilliseconds: undefined,
      millisecondsRemaining: newProps.initialMilliseconds
    });
  }

  public componentDidUpdate(): void {
    if (!this.state.previousMilliseconds && this.state.millisecondsRemaining > 0) {
      this.tick();
    }
  }

  public componentWillUnmount(): void {
    clearTimeout(this.state.timeoutId);
  }

  private tick = () => {
    const currentMilliseconds = Date.now();
    const dt = this.state.previousMilliseconds
      ? currentMilliseconds - this.state.previousMilliseconds
      : 0;
    const interval: number = 1000;

    // correct for small variations in actual timeout time
    const intervalSecondsRemaing: number = interval - (dt % interval);
    let timeout: number = intervalSecondsRemaing;

    if (intervalSecondsRemaing < interval / 2.0) {
      timeout += interval;
    }

    const millisecondsRemaining: number = Math.max(this.state.millisecondsRemaining - dt, 0);
    const isComplete: boolean = this.state.previousMilliseconds && millisecondsRemaining <= 0;

    if (this.state.timeoutId !== undefined) {
      clearTimeout(this.state.timeoutId);
    }

    this.setState({
      timeoutId: isComplete ? undefined : setTimeout(this.tick, timeout),
      previousMilliseconds: currentMilliseconds,
      millisecondsRemaining
    });

    if (isComplete) {
      if (this.props.onExpire) {
        this.props.onExpire();
      }
      return;
    }

    if (this.props.onTick !== undefined) {
      this.props.onTick(millisecondsRemaining);
    }
  };

  private getFormattedTime = (milliseconds: number): string => {
    if (this.props.formatMilliseconds !== undefined) {
      return this.props.formatMilliseconds(milliseconds);
    }
    const remainingSec: number = Math.round(milliseconds / 1000);

    const seconds: number = parseInt((remainingSec % 60).toString(), 10);
    const minutes: number = parseInt(((remainingSec / 60) % 60).toString(), 10);
    const hours: number = parseInt((remainingSec / 3600).toString(), 10);

    const s = seconds < 10 ? '0' + seconds : seconds;
    const m = minutes < 10 ? '0' + minutes : minutes;
    let h = hours < 10 ? '0' + hours : hours;
    h = h === '00' ? '' : h + ':';
    return h + m + ':' + s;
  };

  public render(): React.ReactNode {
    const millisecondsRemaining: number = this.state.millisecondsRemaining;
    const allowFontScaling: boolean = this.props.allowFontScaling;
    const style = this.props.style;
    return (
      <Text allowFontScaling={allowFontScaling} style={style}>
        {this.getFormattedTime(millisecondsRemaining)}
      </Text>
    );
  }

  public static defaultProps = {
    formatMilliseconds: undefined,
    onTick: undefined,
    onExpire: undefined
  };
}
