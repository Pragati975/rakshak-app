#!/usr/bin/env node
// Renames the Android package / application id of a Capacitor project.
// Run it from the project root (the folder that contains "android" and capacitor.config.json):
//   node rename-package.cjs com.example.rakshak com.pragati.rakshak
// Optional third argument sets the app name shown under the icon:
//   node rename-package.cjs com.example.rakshak com.pragati.rakshak "Rakshak"
const fs = require('fs')
const path = require('path')

const [, , oldId, newId, appName] = process.argv
const ID = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/
if (!oldId || !newId || !ID.test(oldId) || !ID.test(newId)) {
  console.error('Usage: node rename-package.cjs <old.id> <new.id> ["App Name"]\nIds are lowercase, dot separated, for example com.pragati.rakshak')
  process.exit(1)
}
const root = process.cwd()
const androidApp = path.join(root, 'android', 'app')
if (!fs.existsSync(androidApp)) { console.error('Run this from the project root: the "android" folder was not found in ' + root); process.exit(1) }

const changed = []
const rewrite = (file, fn) => {
  if (!fs.existsSync(file)) return
  const before = fs.readFileSync(file, 'utf8')
  const after = fn(before)
  if (after !== before) { fs.writeFileSync(file, after); changed.push(path.relative(root, file)) }
}
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) { if (e.name !== 'build' && e.name !== 'node_modules') walk(p, out) } else out.push(p)
  }
  return out
}

// 1. Move the Java/Kotlin source folder: java/com/example/rakshak -> java/com/pragati/rakshak
for (const lang of ['java', 'kotlin']) {
  const base = path.join(androidApp, 'src', 'main', lang)
  const from = path.join(base, ...oldId.split('.'))
  const to = path.join(base, ...newId.split('.'))
  if (!fs.existsSync(from) || from === to) continue
  fs.mkdirSync(path.dirname(to), { recursive: true })
  if (fs.existsSync(to)) { console.error('Target folder already exists: ' + to); process.exit(1) }
  fs.renameSync(from, to)
  // remove old parent folders left empty (com/example)
  let dir = path.dirname(from)
  while (dir.startsWith(base) && dir !== base && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) { fs.rmdirSync(dir); dir = path.dirname(dir) }
}

// 2. Replace the id in every text file that can hold it
const targets = [
  ...walk(path.join(androidApp, 'src', 'main')).filter((f) => /\.(java|kt|xml|json|gradle)$/.test(f)),
  path.join(androidApp, 'build.gradle'),
  path.join(androidApp, 'build.gradle.kts'),
  path.join(root, 'capacitor.config.json'),
  path.join(root, 'capacitor.config.ts'),
  path.join(root, 'capacitor.config.js'),
]
for (const f of targets) rewrite(f, (s) => s.split(oldId).join(newId))

// 3. App name
if (appName) {
  rewrite(path.join(androidApp, 'src', 'main', 'res', 'values', 'strings.xml'), (s) =>
    s.replace(/(<string name="app_name">)[^<]*(<\/string>)/, `$1${appName}$2`).replace(/(<string name="title_activity_main">)[^<]*(<\/string>)/, `$1${appName}$2`))
  rewrite(path.join(root, 'capacitor.config.json'), (s) => s.replace(/("appName"\s*:\s*")[^"]*(")/, `$1${appName}$2`))
}

console.log(changed.length ? 'Updated:\n  ' + changed.join('\n  ') : 'Nothing needed changing (already renamed?)')
console.log(`\nDone: ${oldId} -> ${newId}${appName ? `, app name "${appName}"` : ''}.\nNext: run  npx cap sync  and then in Android Studio use File > Sync Project with Gradle Files, then Build > Clean Project.`)
