
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { useEffect, useState,useRef } from 'react';
import {Platform,View,Text} from 'react-native';
import {Video} from 'expo-av';

export default function SubtitleComponent() {
  const videoRef = useRef(null);
  const [time, setTime] = useState(0);
  const [subs, setSubs] = useState([]);
  const [currentSub, setCurrentSub] = useState('');

  useEffect(() => {
    (async () => {
      const content = await loadAssFile(require('../assets/subtitles.ass'));
      setSubs(parseASS(content));
    })();
  }, []);

  useEffect(() => {
    const sub = subs.find(s => time >= s.start && time <= s.end);
    setCurrentSub(sub ? sub.text : '');
  }, [time, subs]);

  return (
    <div style={{ flex: 1 }}>
      <Video
        ref={videoRef}
        source={{ uri: '../assets/Instagram Reels Video 949.mp4' }}
        style={{ flex: 1 }}
        shouldPlay
        useNativeControls
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded) setTime(status.positionMillis / 1000);
        }}
      />
      <Text style={{
        position: 'absolute',
        bottom: 50,
        width: '100%',
        textAlign: 'center',
        color: 'white',
        fontSize: 18,
        backgroundColor: 'rgba(0,0,0,0.5)'
      }}>
        {currentSub}
      </Text>
    </div>
  );
}












function parseASS(content) {
  const lines = content.split(/\r?\n/);
  const dialogues = [];

  for (let line of lines) {
    if (line.startsWith('Dialogue:')) {
      const parts = line.split(',');
      const start = timeToSeconds(parts[1]);
      const end = timeToSeconds(parts[2]);
      const text = parts.slice(9).join(',').replace(/{.*?}/g, ''); // remove ASS tags
      dialogues.push({ start, end, text });
    }
  }

  return dialogues;
}

function timeToSeconds(t) {
  const [h, m, s] = t.split(':');
  const [sec, ms] = s.split('.');
  return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(sec) + (ms ? parseInt(ms) / 100 : 0);
}

async function loadAssFile(moduleRef: number) {
  const asset = Asset.fromModule(moduleRef);
  await asset.downloadAsync();

  if (Platform.OS === 'web') {
    // On web, fetch directly from the URL
    const response = await fetch(asset.uri);
    return await response.text();
  } else {
    // On iOS/Android, use FileSystem
    return await FileSystem.readAsStringAsync(asset.localUri || '');
  }
}
