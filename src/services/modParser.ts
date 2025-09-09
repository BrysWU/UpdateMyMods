import JSZip from 'jszip';
import { ModFile } from '../types/mod';

export class ModParser {
  static async parseModFile(file: File): Promise<ModFile> {
    const modFile: ModFile = {
      file,
      name: file.name.replace('.jar', ''),
    };

    try {
      if (file.name.endsWith('.jar')) {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        
        // Try to read mod metadata
        await this.readModMetadata(zipContent, modFile);
      }
    } catch (error) {
      console.error('Error parsing mod file:', error);
    }

    return modFile;
  }

  private static async readModMetadata(zip: JSZip, modFile: ModFile) {
    // Try Fabric mod metadata
    const fabricModJson = zip.file('fabric.mod.json');
    if (fabricModJson) {
      try {
        const content = await fabricModJson.async('string');
        const metadata = JSON.parse(content);
        modFile.modId = metadata.id;
        modFile.version = metadata.version;
        modFile.modLoader = 'fabric';
        modFile.name = metadata.name || modFile.name;
        return;
      } catch (error) {
        console.error('Error reading fabric.mod.json:', error);
      }
    }

    // Try Forge mod metadata (mods.toml)
    const modsToml = zip.file('META-INF/mods.toml');
    if (modsToml) {
      try {
        const content = await modsToml.async('string');
        const modIdMatch = content.match(/modId\s*=\s*["']([^"']+)["']/);
        const versionMatch = content.match(/version\s*=\s*["']([^"']+)["']/);
        const displayNameMatch = content.match(/displayName\s*=\s*["']([^"']+)["']/);
        
        if (modIdMatch) modFile.modId = modIdMatch[1];
        if (versionMatch) modFile.version = versionMatch[1];
        if (displayNameMatch) modFile.name = displayNameMatch[1];
        modFile.modLoader = 'forge';
        return;
      } catch (error) {
        console.error('Error reading mods.toml:', error);
      }
    }

    // Try legacy mcmod.info
    const mcmodInfo = zip.file('mcmod.info');
    if (mcmodInfo) {
      try {
        const content = await mcmodInfo.async('string');
        const metadata = JSON.parse(content);
        const modInfo = Array.isArray(metadata) ? metadata[0] : metadata;
        if (modInfo) {
          modFile.modId = modInfo.modid;
          modFile.version = modInfo.version;
          modFile.name = modInfo.name || modFile.name;
          modFile.modLoader = 'forge';
        }
      } catch (error) {
        console.error('Error reading mcmod.info:', error);
      }
    }

    // Try Quilt metadata
    const quiltModJson = zip.file('quilt.mod.json');
    if (quiltModJson) {
      try {
        const content = await quiltModJson.async('string');
        const metadata = JSON.parse(content);
        const quiltLoader = metadata.quilt_loader;
        if (quiltLoader) {
          modFile.modId = quiltLoader.id;
          modFile.version = quiltLoader.version;
          modFile.modLoader = 'quilt';
          if (quiltLoader.metadata && quiltLoader.metadata.name) {
            modFile.name = quiltLoader.metadata.name;
          }
        }
      } catch (error) {
        console.error('Error reading quilt.mod.json:', error);
      }
    }
  }

  static extractModNameForSearch(fileName: string): string {
    // Remove file extension
    let name = fileName.replace(/\.(jar|zip)$/i, '');
    
    // Remove version-like patterns (more comprehensive)
    name = name.replace(/[-_+]\d+\.\d+[\d\w\.\-+]*$/i, '');
    name = name.replace(/[-_+]v?\d+\.\d+[\d\w\.\-+]*$/i, '');
    name = name.replace(/[-_+]\[.*?\]$/i, '');
    name = name.replace(/[-_+]\(.*?\)$/i, '');
    name = name.replace(/[-_+](mc|minecraft)[-_+]?\d+\.\d+[\d\w\.\-+]*$/i, '');
    
    // Remove mod loader indicators
    name = name.replace(/[-_+](forge|fabric|quilt|neoforge)$/i, '');
    name = name.replace(/[-_+](forge|fabric|quilt|neoforge)[-_+]\d+\.\d+[\d\w\.\-+]*$/i, '');
    
    // Remove common suffixes
    name = name.replace(/[-_+](client|server|universal|api|lib|core)$/i, '');
    name = name.replace(/[-_+](mod|addon|plugin)$/i, '');
    
    // Clean up separators
    name = name.replace(/[-_+]+/g, ' ');
    name = name.trim();
    
    return name;
  }

  static generateSearchVariants(baseName: string): string[] {
    const variants = [baseName];
    
    // Add variant with different separators
    variants.push(baseName.replace(/\s+/g, '-'));
    variants.push(baseName.replace(/\s+/g, '_'));
    variants.push(baseName.replace(/\s+/g, ''));
    
    // Add variant without common words
    const withoutCommon = baseName.replace(/\b(mod|addon|plugin|api|lib|core)\b/gi, '').trim();
    if (withoutCommon && withoutCommon !== baseName) {
      variants.push(withoutCommon);
    }
    
    // Remove duplicates
    return [...new Set(variants)].filter(v => v.length > 0);
  }
}