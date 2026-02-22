## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```
## For prisma database
```bash
npm install prisma@6 @prisma/client@6 --save-dev
npm prisma init
npx prisma generate
```

## For shadCn coomponent UI
```bash
npx shadcn@latest init
  then,
npx shadcn@latest add button
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add separator
```
## For database dashboard
```bash
### npx prisma studio
```
## for JWT authentication
```bash
### npm install jsonwebtoken
### npm install bcryptjs
### npm install --save-dev @types/jsonwebtoken
(This will give TypeScript proper types for jsonwebtoken)
```


Working process:
Password is hashed with bcryptjs
JWT token is returned along with the user
Frontend can store token in localStorage or cookies


### npm install prismjs(code highlighter library)
