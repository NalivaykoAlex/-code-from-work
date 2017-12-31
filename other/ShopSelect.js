import React from 'react'
import { Select } from 'semantic-ui-react'

export default ({ shops, onChange, value }) =>
  <Select
    fluid
    placeholder='Выберите магазин...'
    value={value}
    onChange={(e, { value }) => onChange(value)}
    options={shops.map(shop => ({
      // text: `${shop.name} (${shop.products.total})`,
      text: shop.name,
      value: shop.id,
      key: shop.id,
    }))}
  />
