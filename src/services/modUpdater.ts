import JSZip from 'jszip';
import { DetectedMod, UpdateResult } from '../types/mod';
import { ModrinthAPI, CurseForgeAPI } from './api';

export class ModUpdater {
  static async updateMods(
    mods: DetectedMod[],
    targetVersions: string[],
    targetLoaders: string[],
    onProgress?: (progress: number, current: string) => void
  ): Promise<UpdateResult[]> {
    const results: UpdateResult[] = [];
    const totalMods = mods.length;

    for (let i = 0; i < totalMods; i++) {
      const mod = mods[i];
      onProgress?.(((i + 1) / totalMods) * 100, mod.file.name);

      const result = await this.updateSingleMod(mod, targetVersions, targetLoaders);
      results.push(result);
    }

    return results;
  }

  private static async updateSingleMod(
    mod: DetectedMod,
    targetVersions: string[],
    targetLoaders: string[]
  ): Promise<UpdateResult> {
    if (mod.status !== 'found') {
      return {
        mod,
        updated: false,
        error: 'Mod not found on any platform'
      };
    }

    try {
      if (mod.modrinthMod) {
        return await this.updateFromModrinth(mod, targetVersions, targetLoaders);
      } else if (mod.curseforgeMod) {
        return await this.updateFromCurseforge(mod, targetVersions, targetLoaders);
      }
    } catch (error) {
      return {
        mod,
        updated: false,
        error: `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    return {
      mod,
      updated: false,
      error: 'No compatible version found'
    };
  }

  private static async updateFromModrinth(
    mod: DetectedMod,
    targetVersions: string[],
    targetLoaders: string[]
  ): Promise<UpdateResult> {
    // Use the slug from the mod object, not the ID
    const modIdentifier = mod.modrinthMod!.slug || mod.modrinthMod!.id;
    console.log(`Getting versions for Modrinth mod: ${modIdentifier}`);
    
    const versions = await ModrinthAPI.getModVersions(
      modIdentifier,
      targetVersions,
      targetLoaders
    );

    if (versions.length === 0) {
      return {
        mod,
        updated: false,
        error: 'No compatible versions found'
      };
    }

    // Sort by date and get the latest
    const latestVersion = versions.sort(
      (a, b) => new Date(b.date_published).getTime() - new Date(a.date_published).getTime()
    )[0];

    const primaryFile = latestVersion.files.find(f => f.primary) || latestVersion.files[0];

    return {
      mod,
      updated: true,
      newFile: {
        url: primaryFile.url,
        filename: primaryFile.filename,
        version: latestVersion.version_number
      }
    };
  }

  private static async updateFromCurseforge(
    mod: DetectedMod,
    targetVersions: string[],
    targetLoaders: string[]
  ): Promise<UpdateResult> {
    const loaderIds = this.getLoaderIds(targetLoaders);
    let files = [];

    // Try to get files for each version
    for (const version of targetVersions) {
      for (const loaderId of loaderIds) {
        const versionFiles = await CurseForgeAPI.getModFiles(
          mod.curseforgeMod!.id,
          version,
          loaderId
        );
        files.push(...versionFiles);
      }
    }

    if (files.length === 0) {
      files = await CurseForgeAPI.getModFiles(mod.curseforgeMod!.id);
    }

    if (files.length === 0) {
      return {
        mod,
        updated: false,
        error: 'No files found for this mod'
      };
    }

    // Sort by date and get the latest
    const latestFile = files.sort(
      (a, b) => new Date(b.fileDate).getTime() - new Date(a.fileDate).getTime()
    )[0];

    return {
      mod,
      updated: true,
      newFile: {
        url: latestFile.downloadUrl,
        filename: latestFile.fileName,
        version: latestFile.displayName
      }
    };
  }

  private static getLoaderIds(loaders: string[]): number[] {
    const loaderMap: { [key: string]: number } = {
      'forge': 1,
      'fabric': 4,
      'quilt': 5,
      'neoforge': 6
    };

    return loaders.map(loader => loaderMap[loader]).filter(id => id !== undefined);
  }

  static async createUpdateZip(results: UpdateResult[]): Promise<Blob> {
    const zip = new JSZip();
    const modsFolder = zip.folder('mods');
    
    const updatedMods: string[] = [];
    const failedMods: string[] = [];

    for (const result of results) {
      if (result.updated && result.newFile) {
        try {
          // Download the mod file
          const response = await fetch(result.newFile.url);
          if (response.ok) {
            const blob = await response.blob();
            modsFolder?.file(result.newFile.filename, blob);
            updatedMods.push(`${result.mod.file.name} -> ${result.newFile.version}`);
          } else {
            failedMods.push(`${result.mod.file.name}: Download failed`);
          }
        } catch (error) {
          failedMods.push(`${result.mod.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        failedMods.push(`${result.mod.file.name}: ${result.error || 'Update failed'}`);
      }
    }

    // Create update report
    let report = '=== MINECRAFT MOD UPDATE REPORT ===\n\n';
    
    if (updatedMods.length > 0) {
      report += `SUCCESSFULLY UPDATED (${updatedMods.length}):\n`;
      report += updatedMods.map(mod => `✓ ${mod}`).join('\n');
      report += '\n\n';
    }
    
    if (failedMods.length > 0) {
      report += `FAILED TO UPDATE (${failedMods.length}):\n`;
      report += failedMods.map(mod => `✗ ${mod}`).join('\n');
      report += '\n\n';
    }
    
    report += `Generated on: ${new Date().toLocaleString()}\n`;
    report += `Total mods processed: ${results.length}\n`;
    report += `Success rate: ${((updatedMods.length / results.length) * 100).toFixed(1)}%`;

    zip.file('UPDATE_REPORT.txt', report);

    return await zip.generateAsync({ type: 'blob' });
  }
}