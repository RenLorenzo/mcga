# MJGA — Make JEE Great Again (claude-code experiment (1prompt challenge)

Static site ready for Vercel.

## Main Entrypoints
- `/` → `index.html` (MJGA main)
- `/syllabus` → `syllabus.html`
- `/calc` → `testplaformlanding.html` (Calc Session)

## Deploy on Vercel
1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. Import repo on Vercel.
3. Framework Preset: "Other".
4. Build Command: none (leave empty).
5. Output Directory: `.` (project root).
6. Ensure `vercel.json` is included (it rewrites `/` to the main `index.html`).

## Local dev
You can serve locally with any static server, e.g.:

```bash
npx serve .
```


Or VSCode Live Server extension. 
