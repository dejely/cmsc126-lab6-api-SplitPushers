import './style.css'

type ChampionApiResponse = {
  data: Record<string, ChampionApi>
}

type ChampionApi = {
  id: string
  name: string
  title: string
  tags: string[]
  partype: string
  stats: {
    attack: number
    defense: number
    magic: number
    difficulty: number
  }
  image: {
    full: string
  }
}

type Champion = {
  id: string
  name: string
  title: string
  roles: string[]
  resource: string
  stats: ChampionApi['stats']
  imageUrl: string
}

function requireElement<T extends HTMLElement>(id: string) {
  const element = document.getElementById(id) as T | null

  if (!element) {
    throw new Error(`Expected element "#${id}" was not found.`)
  }

  return element
}

const championList = requireElement<HTMLDivElement>('champion-list')
const status = requireElement<HTMLParagraphElement>('status')
const championCount = requireElement<HTMLSpanElement>('champion-count')
const championPatch = requireElement<HTMLSpanElement>('champion-patch')

async function getLatestVersion() {
  const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')

  if (!response.ok) {
    throw new Error('Unable to load the latest Data Dragon version.')
  }

  const versions = (await response.json()) as string[]
  const latestVersion = versions[0]

  if (!latestVersion) {
    throw new Error('No Data Dragon version was returned.')
  }

  return latestVersion
}

async function getChampions() {
  const version = await getLatestVersion()
  const response = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
  )

  if (!response.ok) {
    throw new Error('Unable to load champion data.')
  }

  const data = (await response.json()) as ChampionApiResponse
  const champions = Object.values(data.data)
    .map(
      (champion): Champion => ({
        id: champion.id,
        name: champion.name,
        title: champion.title,
        roles: champion.tags,
        resource: champion.partype || 'Mixed',
        stats: champion.stats,
        imageUrl: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`,
      }),
    )
    .sort((first, second) => first.name.localeCompare(second.name))

  return { champions, version }
}

function renderChampions(champions: Champion[]) {
  championList.innerHTML = champions
    .map(
      (champion) => `
        <article class="champion-card">
          <div class="card-header">
            <img
              class="champion-avatar"
              src="${champion.imageUrl}"
              alt="${champion.name}"
              loading="lazy"
              width="72"
              height="72"
            />
            <div>
              <h2>${champion.name}</h2>
              <p class="champion-title">${champion.title}</p>
            </div>
          </div>
          <div class="tag-row">
            ${champion.roles
              .map((role) => `<span class="tag">${role}</span>`)
              .join('')}
            <span class="tag tag-muted">${champion.resource}</span>
          </div>
          <dl class="stats-grid">
            <div>
              <dt>Attack</dt>
              <dd>${champion.stats.attack}</dd>
            </div>
            <div>
              <dt>Defense</dt>
              <dd>${champion.stats.defense}</dd>
            </div>
            <div>
              <dt>Magic</dt>
              <dd>${champion.stats.magic}</dd>
            </div>
            <div>
              <dt>Difficulty</dt>
              <dd>${champion.stats.difficulty}</dd>
            </div>
          </dl>
        </article>
      `,
    )
    .join('')
}

async function loadChampions() {
  try {
    const { champions, version } = await getChampions()

    renderChampions(champions)
    status.textContent = `Showing ${champions.length} champions.`
    championCount.textContent = `${champions.length} champions`
    championPatch.textContent = `Patch ${version}`
  } catch (error) {
    status.textContent =
      error instanceof Error
        ? error.message
        : 'Something went wrong while loading champions.'
    championCount.textContent = 'Champion data unavailable'
  }
}

void loadChampions()
