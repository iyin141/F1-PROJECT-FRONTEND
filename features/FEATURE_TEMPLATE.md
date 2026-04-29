Feature Template

Copy this folder and edit the files.

Tree:

features/<name>/
components/
hooks/
state/
types.ts
api.ts
index.ts
README.md
feature.config.json

index.ts (example):

export { default } from './page';

Route integration:

// app/<route>/page.tsx
import FeatureEntry from 'features/<name>';
export default function Page({ params }) { const data = /_ fetch _/; return <FeatureEntry initialData={data} /> }
