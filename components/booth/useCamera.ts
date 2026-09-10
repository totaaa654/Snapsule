'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
export function useCamera() {
  const video = useRef<HTMLVideoElement>(null),
    stream = useRef<MediaStream | null>(null),
    request = useRef(0),
    alive = useRef(true);
  const [status, setStatus] = useState<
      'idle' | 'requesting' | 'ready' | 'error'
    >('idle'),
    [error, setError] = useState(''),
    [devices, setDevices] = useState<MediaDeviceInfo[]>([]),
    [device, setDevice] = useState('');
  const stop = useCallback(() => {
    request.current++;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);
  const attach = useCallback((node: HTMLVideoElement | null) => {
    video.current = node;
    if (node && stream.current) {
      node.srcObject = stream.current;
      void node.play();
    }
  }, []);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      stop();
    };
  }, [stop]);
  const start = useCallback(
    async (id = '') => {
      stop();
      const token = request.current;
      setStatus('requesting');
      setError('');
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          'Camera access needs a secure browser connection. Open this page using HTTPS, or localhost on your computer.',
        );
        setStatus('error');
        return;
      }
      const timeout = setTimeout(() => {
        if (alive.current && token === request.current) {
          request.current++;
          setStatus('error');
          setError(
            'The camera is still waiting for permission. Check the camera icon in your address bar, then try again.',
          );
        }
      }, 20000);
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: id
            ? {
                deviceId: { exact: id },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              }
            : {
                facingMode: 'user',
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              },
          audio: false,
        });
        if (!alive.current || token !== request.current) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        stream.current = media;
        if (video.current) {
          video.current.srcObject = media;
          await video.current.play();
        }
        if (!alive.current || token !== request.current) return;
        setDevice(media.getVideoTracks()[0].getSettings().deviceId || id);
        setDevices(
          (await navigator.mediaDevices.enumerateDevices()).filter(
            (d) => d.kind === 'videoinput',
          ),
        );
        setStatus('ready');
        media.getVideoTracks()[0].onended = () => {
          if (alive.current && token === request.current) {
            setStatus('error');
            setError('Your camera disconnected. Reconnect it, then try again.');
          }
        };
      } catch (e) {
        if (alive.current && token === request.current) {
          stream.current?.getTracks().forEach((t) => t.stop());
          stream.current = null;
          const name = e instanceof DOMException ? e.name : '';
          setError(
            name === 'NotAllowedError'
              ? 'Camera permission was declined. Allow the camera in your browser settings, then try again.'
              : name === 'NotFoundError'
                ? 'We couldn’t find a camera. Connect one and try again.'
                : name === 'NotReadableError'
                  ? 'Your camera may be busy in another app. Close it there, then try again.'
                  : 'We couldn’t start that camera. Please try again or choose another camera.',
          );
          setStatus('error');
        }
      } finally {
        clearTimeout(timeout);
      }
    },
    [stop],
  );
  return { video, attach, status, error, devices, device, start, stop };
}
