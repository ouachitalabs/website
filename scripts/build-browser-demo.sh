#!/bin/sh
# Rebuild the static browser scene from the same revision as the reference hero.
set -eu
root=$(cd "$(dirname "$0")/.." && pwd)
out="$root/assets/browser-demo"
revision=0a923358ea989d7602f0d06507ad3447c62ffe9b
build=$(mktemp -d)
trap 'rm -rf "$build"' EXIT
cd "$build"
curl --retry 2 --connect-timeout 10 --max-time 90 -fsSL "https://codeload.github.com/vercel-labs/agent-browser/tar.gz/$revision" -o source.tgz
tar -xzf source.tgz --strip-components=1
# Only the browser camera is mounted. Omit the off-camera desktop applications.
patch -s -d docs/src/components/landing/hero-scene -p1 < "$root/scripts/permit-renewal.patch"
scene=docs/src/components/landing/hero-scene/browser-desktop-scene.tsx
sed -e '/import { DesktopApps }/d' -e '/<DesktopApps /d' -e '/<PresenceCursor who="\(claude\|openai\|gemini\)"/d' "$scene" > browser.tsx
mv browser.tsx "$scene"
python3 - <<'PY'
from pathlib import Path
base = Path("docs/src/components/landing")
p = base / "hero-scene/browser-desktop-scene.tsx"
s = p.read_text()
start = s.index("An agent notices a bug")
p.write_text(s[:start] + "An animated agent collects a business’s current permit and insurance certificate, then drops both into a sample city renewal draft for the owner to review." + s[s.index("</figcaption>", start):])
p = base / "hero-scene/presence-cursor.tsx"
p.write_text(p.read_text().replace('import { BrandMark } from \'../compat\'', 'import { BrandMark } from \'../compat/brand-mark\'').replace('name={mark} size={MARK_SIZE[mark]}', 'name="openai" size={MARK_SIZE.openai}'))
p = base / "compat/brand-mark.tsx"
p.write_text(p.read_text().replace('import { cn } from "@/lib/utils";', '').replace('cn(styles.mark, className)', '[styles.mark, className].filter(Boolean).join(" ")'))
p = base / "hero-scene/hero-playback.ts"
s = p.read_text().replace('  return { script, time, playing };', '''
  useEffect(() => {
    const control = document.querySelector<HTMLButtonElement>(".demo-transport")!;
    const state = transport.current;
    let paused = false;
    let visible = true;
    function update() {
      state.playing = !state.reduced && !paused && visible && !document.hidden;
      state.active?.wake();
      setPlaying(state.playing);
      control.hidden = state.reduced;
      control.textContent = paused ? "Resume" : "Pause";
    }
    function toggle() { paused = !paused; update(); }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(document.querySelector(".ab-hero-demo")!);
    control.addEventListener("click", toggle);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      control.removeEventListener("click", toggle);
      document.removeEventListener("visibilitychange", update);
    };
  }, [reduced]);
  return { script, time, playing };''')
p.write_text(s)
PY
mkdir tooling
cd tooling
npm init -y >/dev/null
npm install --silent --no-audit --no-fund esbuild@0.25.12 react@19.2.3 react-dom@19.2.3 lucide-react@0.468.0
cd ..
mv tooling/node_modules .
cat > entry.tsx <<'JS'
import {createRoot} from "react-dom/client";
import {BrowserDesktopScene} from "./docs/src/components/landing/hero-scene/browser-desktop-scene";
createRoot(document.getElementById("scene")!).render(<BrowserDesktopScene desktop={false} />);
JS
node_modules/.bin/esbuild entry.tsx --bundle --minify --jsx=automatic --tsconfig-raw='{}' --define:process.env.NODE_ENV='"production"' --outfile="$out/scene.js"
{
  echo "Browser scene adapted from vercel-labs/agent-browser at $revision."
  echo "Ouachita Labs changes: fictional permit renewal, browser-only rendering, ChatGPT cursor, theme and playback controls."
  cat LICENSE docs/src/components/stageshow/vendor/LICENSE docs/src/components/landing/compat/assets/LICENSE-SVGL.txt
  cat node_modules/react/LICENSE node_modules/react-dom/LICENSE node_modules/scheduler/LICENSE node_modules/lucide-react/LICENSE
} > "$out/LICENSES.txt"
