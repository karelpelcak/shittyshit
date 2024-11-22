# @web/shop-logic

> Shared logic for RegioJet tickets web and mobile application

[![NPM](https://img.shields.io/npm/v/@regiojet/shop-logic.svg)](https://www.npmjs.com/package/@regiojet/shop-logic) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
# Set URL for your scoped packages:
npm config set @web:registry https://gitlab.sa.cz/api/v4/projects/703/packages/npm/
# Add the token for the scoped private packages URL:
npm set '//gitlab.sa.cz/api/v4/projects/703/packages/npm/:_authToken' "Tzanyf_KWX3xrmbxgtC5"

npm install --save @web/shop-logic
```

## Usage

```tsx
import React from 'react'
import useCredit from '@web/shop-logic'

const Example: React.FC = () => {
  const { addCredit } = useCredit();

  return <button type="submit" onClick={() => addCredit()} />
}
```

## Development
Use these commit messages for semantic release to do its job:

- `fix: I just fixed something in this commit` for smallest but crucial updates
- `feat: I made a new feature!` for ~minor~ feature releases
- `BREAKING CHANGE: I changed something big.` as second commit message for ~major~ breaking releases

This will generate new versions automatically.
More info here: [how-does-it-work](https://github.com/semantic-release/semantic-release#how-does-it-work)

## License

MIT © [martincapek](https://github.com/martincapek)
