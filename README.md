# uuun — портфолио Minecraft-разработчика

Одностраничный лендинг-портфолио на React (Vite) + Tailwind CSS + Framer Motion + Lucide Icons.
Весь контент (профиль, скиллы, проекты) хранится в `src/data/content.json` — код трогать не нужно.

## Стек

- **React 18 + Vite 5** — сборка
- **Tailwind CSS 3** — стили, кастомные токены в `tailwind.config.js`
- **Framer Motion** — анимации (scroll-reveal, фильтры, hover)
- **Lucide React** — иконки (без эмодзи)

## Быстрый старт

```bash
npm install
npm run dev        # локальный сервер на http://localhost:5173
npm run build       # прод-сборка в папку dist/
npm run preview     # предпросмотр прод-сборки
```

Требуется Node.js 18+.

---

## Как добавить проект в портфолио

Открой `src/data/content.json` и добавь новый объект в массив `projects`. Ничего пересобирать вручную не нужно — Vite сам обновит страницу в dev-режиме.

```json
{
  "id": "9",
  "title": "Название проекта",
  "type": "plugin",
  "description": "Краткое описание функционала.",
  "status": "open",
  "githubUrl": "https://github.com/uuun/your-repo",
  "tags": ["Java", "Paper API"],
  "image": "./images/proj-1.svg"
}
```

Поля:

| Поле | Значения | Комментарий |
|---|---|---|
| `id` | строка | должен быть уникальным |
| `type` | `plugin` \| `mod` \| `modpack` | определяет бейдж и попадание во вкладку фильтра |
| `status` | `open` \| `closed` | `open` — показывает плашку "Open Source" и ссылку на GitHub; `closed` — плашку "Private / Closed Source" без ссылки |
| `githubUrl` | ссылка | обязательна только при `status: "open"` |
| `tags` | массив строк | участвуют в поиске |
| `image` | путь/URL | можно указать свою картинку из `public/images/` или внешний URL |

Проектов может быть сколько угодно — сетка (bento-grid) адаптируется автоматически, каждая пятая карточка становится широкой для визуального ритма (настраивается в `src/components/Portfolio.jsx`, параметр `wide={i % 5 === 0}`).

### Профиль и соцсети

Секция `profile` в том же файле управляет хиро-блоком и футером: имя, тэглайн, био, статус доступности и ссылки на соцсети. Иконки соцсетей маппятся по ключу `icon` (`github`, `discord`, `telegram`, `mail`) в `src/components/Hero.jsx` и `Footer.jsx`.

### Навыки (Skills)

Секция `skills` — карточки bento-грида. Поле `size` (`lg` / `md` / `sm`) задаёт размер карточки. Поле `icon` — имя иконки из [lucide-react](https://lucide.dev/icons/); если добавляешь новую иконку, её нужно один раз импортировать и зарегистрировать в `ICON_MAP` в `src/components/Skills.jsx`.

---

## Деплой на GitHub Pages

Проект уже настроен на относительные пути (`base: './'` в `vite.config.js`), поэтому работает на любом GitHub Pages URL без правок конфига.

### Вариант A — автодеплой через GitHub Actions (рекомендуется)

В репозитории уже лежит workflow `.github/workflows/deploy.yml`, который на каждый пуш в `main` собирает проект и публикует `dist/` на GitHub Pages.

1. Создай репозиторий на GitHub и запушь в него этот проект:
   ```bash
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/<твой-юзернейм>/<репозиторий>.git
   git push -u origin main
   ```
2. В репозитории зайди в **Settings → Pages**.
3. В разделе **Build and deployment → Source** выбери **GitHub Actions**.
4. Сделай любой пуш в `main` (или запусти workflow вручную во вкладке **Actions** → *Deploy to GitHub Pages* → **Run workflow**).
5. Через 1–2 минуты сайт будет доступен по адресу `https://<твой-юзернейм>.github.io/<репозиторий>/`.

### Вариант B — ручной деплой через ветку `gh-pages`

```bash
npm run build
npm run deploy
```

Команда `deploy` (пакет `gh-pages`, уже в `devDependencies`) соберёт проект и запушит содержимое `dist/` в ветку `gh-pages`. После первого запуска включи в **Settings → Pages → Source** вариант **Deploy from a branch** и укажи ветку `gh-pages` / папку `/ (root)`.

---

## Структура проекта

```
uuun-portfolio/
├── .github/workflows/deploy.yml   # автодеплой на GitHub Pages
├── public/
│   ├── favicon.svg
│   └── images/                    # плейсхолдеры карточек проектов
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── Skills.jsx             # bento-grid навыков
│   │   ├── Portfolio.jsx          # фильтры, поиск, сетка проектов
│   │   ├── ProjectCard.jsx
│   │   ├── Footer.jsx
│   │   └── Reveal.jsx             # scroll-reveal обёртки (fade-up + blur)
│   ├── data/content.json          # ВЕСЬ контент сайта
│   ├── lib/utils.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## Дизайн-токены

- Фон: `#09090B`, карточки: `#121215`, границы: `border-white/10`
- Акцент: приглушённый зелёный `#6B9080` (без неона и AI-градиентов)
- Шрифты: **Fraunces** (display/serif, заголовки) + **IBM Plex Sans** (текст) + **IBM Plex Mono** (теги)
- Все конфигурационные значения — в `tailwind.config.js`
