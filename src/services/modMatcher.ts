import Fuse from 'fuse.js';
import { ModrinthAPI, CurseForgeAPI } from './api';
import { DetectedMod, ModFile } from '../types/mod';
import { ModParser } from './modParser';

export class ModMatcher {
  static async findMod(modFile: ModFile): Promise<DetectedMod> {
    const detectedMod: DetectedMod = {
      file: modFile,
      status: 'analyzing'
    };

    // If we have a mod ID, try direct lookup first
    if (modFile.modId) {
      console.log(`Trying direct lookup for mod ID: ${modFile.modId}`);
      // Try both the mod ID and a slug version (with dashes)
      let modrinthMod = await ModrinthAPI.getMod(modFile.modId);
      if (!modrinthMod) {
        const slugVersion = modFile.modId.toLowerCase().replace(/[^a-z0-9]/g, '-');
        console.log(`Trying slug version: ${slugVersion}`);
        modrinthMod = await ModrinthAPI.getMod(slugVersion);
      }
      if (modrinthMod) {
        console.log(`Found mod on Modrinth: ${modrinthMod.title}`);
        detectedMod.modrinthMod = modrinthMod;
        detectedMod.status = 'found';
        return detectedMod;
      }
    }

    // Generate multiple search variants
    const baseName = modFile.name || ModParser.extractModNameForSearch(modFile.file.name);
    const searchVariants = ModParser.generateSearchVariants(baseName);
    
    console.log(`Searching for mod with variants:`, searchVariants);
    
    // Try each search variant
    for (const searchQuery of searchVariants) {
      console.log(`Searching Modrinth for: "${searchQuery}"`);
      
      // Search Modrinth
      const modrinthResults = await ModrinthAPI.searchMods(searchQuery);
      const modrinthMod = this.findBestMatch(searchQuery, modFile, modrinthResults.hits);
      if (modrinthMod) {
        console.log(`Found mod on Modrinth: ${modrinthMod.title}`);
        detectedMod.modrinthMod = modrinthMod;
        detectedMod.status = 'found';
        return detectedMod;
      }

      // Search CurseForge
      console.log(`Searching CurseForge for: "${searchQuery}"`);
      const curseforgeResults = await CurseForgeAPI.searchMods(searchQuery);
      const curseforgeMod = this.findBestMatch(searchQuery, modFile, curseforgeResults.data);
      if (curseforgeMod) {
        console.log(`Found mod on CurseForge: ${curseforgeMod.name}`);
        detectedMod.curseforgeMod = curseforgeMod;
        detectedMod.status = 'found';
        return detectedMod;
      }
    }

    console.log(`No matches found for: ${baseName}`);
    detectedMod.status = 'not_found';

    return detectedMod;
  }

  private static findBestMatch(query: string, modFile: ModFile, results: any[]): any {
    if (!results || results.length === 0) return null;

    // Prefer exact mod ID matches if available
    if (modFile.modId) {
      const exactMatch = results.find(mod => 
        (mod.id && mod.id.toLowerCase() === modFile.modId.toLowerCase()) || 
        (mod.slug && mod.slug.toLowerCase() === modFile.modId.toLowerCase()) ||
        (mod.slug && mod.slug.toLowerCase().replace(/-/g, '') === modFile.modId.toLowerCase().replace(/[^a-z0-9]/g, ''))
      );
      if (exactMatch) {
        console.log(`Found exact ID match: ${exactMatch.title || exactMatch.name}`);
        return exactMatch;
      }
    }

    // Try exact name matches first
    const exactNameMatch = results.find(mod => {
      const modTitle = (mod.title || mod.name || '').toLowerCase();
      const queryLower = query.toLowerCase();
      return modTitle === queryLower || 
             modTitle.replace(/[-_\s]/g, '') === queryLower.replace(/[-_\s]/g, '');
    });
    
    if (exactNameMatch) {
      console.log(`Found exact name match: ${exactNameMatch.title || exactNameMatch.name}`);
      return exactNameMatch;
    }

    // Use fuzzy matching as fallback
    const fuse = new Fuse(results, {
      keys: ['title', 'name', 'slug'],
      threshold: 0.4,
      includeScore: true
    });

    const fuzzyResults = fuse.search(query);
    
    if (fuzzyResults.length > 0 && fuzzyResults[0].score! < 0.4) {
      console.log(`Found fuzzy match: ${fuzzyResults[0].item.title || fuzzyResults[0].item.name} (score: ${fuzzyResults[0].score})`);
      return fuzzyResults[0].item;
    }

    console.log(`No good matches found for query: ${query}`);
    return null;
  }
}