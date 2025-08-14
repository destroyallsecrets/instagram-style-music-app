import { ReactNode } from "react";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  action: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

// Context menu item factory functions
export const createTrackContextMenuItems = (track: any, actions: any, icons: any): ContextMenuItem[] => [
  {
    id: 'play',
    label: 'Play Now',
    icon: icons.Play,
    action: () => actions.playTrack(track),
  },
  {
    id: 'favorite',
    label: 'Add to Favorites',
    icon: icons.Heart,
    action: () => actions.toggleFavorite(track),
  },
  {
    id: 'playlist',
    label: 'Add to Playlist',
    icon: icons.Plus,
    action: () => actions.addToPlaylist(track),
  },
  {
    id: 'share',
    label: 'Share Track',
    icon: icons.Share,
    action: () => actions.shareTrack(track),
  },
  {
    id: 'download',
    label: 'Download',
    icon: icons.Download,
    action: () => actions.downloadTrack(track),
    disabled: !track.downloadable,
  },
  {
    id: 'info',
    label: 'Track Info',
    icon: icons.Info,
    action: () => actions.showTrackInfo(track),
  },
];