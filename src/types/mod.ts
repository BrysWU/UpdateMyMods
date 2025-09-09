export interface ModFile {
  file: File;
  name: string;
  version?: string;
  modId?: string;
  modLoader?: string;
}

export interface DetectedMod {
  file: ModFile;
  modrinthMod?: ModrinthMod;
  curseforgeMod?: CurseforgeMod;
  status: 'found' | 'not_found' | 'analyzing';
}

export interface ModrinthMod {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon_url?: string;
  game_versions: string[];
  loaders: string[];
}

export interface ModrinthVersion {
  id: string;
  name: string;
  version_number: string;
  game_versions: string[];
  loaders: string[];
  files: ModrinthFile[];
  date_published: string;
}

export interface ModrinthFile {
  hashes: {
    sha1: string;
    sha512: string;
  };
  url: string;
  filename: string;
  primary: boolean;
  size: number;
}

export interface CurseforgeMod {
  id: number;
  name: string;
  summary: string;
  logo?: {
    url: string;
  };
  gameVersions: string[];
  latestFiles: CurseforgeFile[];
}

export interface CurseforgeFile {
  id: number;
  displayName: string;
  fileName: string;
  fileDate: string;
  fileLength: number;
  downloadUrl: string;
  gameVersions: string[];
  modLoader?: number;
}

export interface UpdateResult {
  mod: DetectedMod;
  updated: boolean;
  newFile?: {
    url: string;
    filename: string;
    version: string;
  };
  error?: string;
}