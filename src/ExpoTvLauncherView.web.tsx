import * as React from 'react';

import { ExpoTvLauncherViewProps } from './ExpoTvLauncher.types';

export default function ExpoTvLauncherView(props: ExpoTvLauncherViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
