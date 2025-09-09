const MODRINTH_API_BASE = 'https://api.modrinth.com/v2';
const CURSEFORGE_API_BASE = 'https://api.curseforge.com/v1';
const CURSEFORGE_API_KEY = '$2a$10$fK30vNTblQvB9wHtDAEKJeVPf868rNH9A8UJleruF1vC9g7GSloWi';

export class ModrinthAPI {
  static async searchMods(query: string) {
    try {
      console.log(`Modrinth API search: ${query}`);
      const response = await fetch(
        `${MODRINTH_API_BASE}/search?query=${encodeURIComponent(query)}&facets=[["project_type:mod"]]&limit=10`
      );
      const result = await response.json();
      console.log(`Modrinth search results for "${query}":`, result.hits?.length || 0, 'hits');
      return result;
    } catch (error) {
      console.error('Modrinth search error:', error);
      return { hits: [] };
    }
  }

  static async getMod(id: string) {
    try {
      console.log(`Modrinth API get mod: ${id}`);
      const response = await fetch(`${MODRINTH_API_BASE}/project/${id}`);
      if (!response.ok) {
        console.log(`Modrinth mod not found: ${id} (${response.status})`);
        return null;
      }
      const result = await response.json();
      console.log(`Modrinth mod found: ${result.title}`);
      return result;
    } catch (error) {
      console.error('Modrinth mod fetch error:', error);
      return null;
    }
  }

  static async getModVersions(id: string, gameVersions: string[], loaders: string[]) {
    try {
      const gameVersionsParam = gameVersions.map(v => `"${v}"`).join(',');
      const loadersParam = loaders.map(l => `"${l}"`).join(',');
      const url = `${MODRINTH_API_BASE}/project/${id}/version?game_versions=[${gameVersionsParam}]&loaders=[${loadersParam}]`;
      console.log(`Modrinth versions URL: ${url}`);
      const response = await fetch(
        url
      );
      if (!response.ok) {
        console.log(`Modrinth versions not found: ${id} (${response.status})`);
        return [];
      }
      const result = await response.json();
      console.log(`Modrinth versions found for ${id}:`, result.length);
      return result;
    } catch (error) {
      console.error('Modrinth versions fetch error:', error);
      return [];
    }
  }
}

export class CurseForgeAPI {
  static async searchMods(query: string) {
    try {
      console.log(`CurseForge API search: ${query}`);
      const response = await fetch(
        `${CURSEFORGE_API_BASE}/mods/search?gameId=432&classId=6&searchFilter=${encodeURIComponent(query)}&pageSize=10`,
        {
          headers: {
            'x-api-key': CURSEFORGE_API_KEY,
          },
        }
      );
      if (!response.ok) {
        console.log(`CurseForge search failed: ${response.status}`);
        return { data: [] };
      }
      const result = await response.json();
      console.log(`CurseForge search results for "${query}":`, result.data?.length || 0, 'hits');
      return result;
    } catch (error) {
      console.error('CurseForge search error:', error);
      return { data: [] };
    }
  }

  static async getMod(id: number) {
    try {
      console.log(`CurseForge API get mod: ${id}`);
      const response = await fetch(`${CURSEFORGE_API_BASE}/mods/${id}`, {
        headers: {
          'x-api-key': CURSEFORGE_API_KEY,
        },
      });
      if (!response.ok) {
        console.log(`CurseForge mod not found: ${id} (${response.status})`);
        return null;
      }
      const result = await response.json();
      console.log(`CurseForge mod found: ${result.data?.name}`);
      return result.data;
    } catch (error) {
      console.error('CurseForge mod fetch error:', error);
      return null;
    }
  }

  static async getModFiles(modId: number, gameVersion?: string, modLoaderId?: number) {
    try {
      let url = `${CURSEFORGE_API_BASE}/mods/${modId}/files?pageSize=20`;
      if (gameVersion) url += `&gameVersion=${gameVersion}`;
      if (modLoaderId) url += `&modLoaderType=${modLoaderId}`;
      
      console.log(`CurseForge files URL: ${url}`);
      const response = await fetch(url, {
        headers: {
          'x-api-key': CURSEFORGE_API_KEY,
        },
      });
      if (!response.ok) {
        console.log(`CurseForge files not found: ${modId} (${response.status})`);
        return [];
      }
      const result = await response.json();
      console.log(`CurseForge files found for ${modId}:`, result.data?.length || 0);
      return result.data || [];
    } catch (error) {
      console.error('CurseForge files fetch error:', error);
      return [];
    }
  }
}