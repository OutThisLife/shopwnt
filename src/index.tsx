import 'normalize.css'
import React from 'react'
import { render } from 'react-dom'
import App from './app'
import './index.css'
import { storage } from './util'

render(
  <React.StrictMode>
    <App
      brands={
        storage.get('brands') ?? [
          { slug: 'veronicabeard' },
          { slug: 'loveshackfancy' },
          { slug: 'fillyboo' }
        ]
      }
    />
  </React.StrictMode>,
  document.getElementById('root')
)
