import React from 'react'
import { Link } from 'react-router-dom'
import { Tab, Breadcrumb, Divider } from 'semantic-ui-react'

import { getSegmentName } from 'utils'

import ShopCategoriesContainer from 'containers/segments/ShopCategoriesContainer'
import ShopBranchesContainer from 'containers/segments/ShopBranchesContainer'
import ShopSelect from './ShopSelect'
import ShopForm from './Form'

export class ShopsListView extends React.Component {
  render() {
    const { selectedShopId, shops, onShopSelect, onShopUpdate, segment } = this.props

    const selectedShop = shops.find(shop => shop.id == selectedShopId)

    return (
      <div>
        <Breadcrumb>
          <Breadcrumb.Section><Link to='/segments'>Сегменты</Link></Breadcrumb.Section>
          <Breadcrumb.Divider />
          <Breadcrumb.Section><Link to={`/segments/${segment}`}>{getSegmentName(segment)}</Link></Breadcrumb.Section>
          <Breadcrumb.Divider />
          <Breadcrumb.Section active>Магазины</Breadcrumb.Section>
        </Breadcrumb>
        <Divider />
        <ShopSelect shops={shops} onChange={onShopSelect} value={selectedShopId}/>
        <Divider />
        {selectedShopId &&
          <Tab
            panes={[
              {
                menuItem: 'Информация о магазине',
                render: () =>
                  <Tab.Pane>
                    <ShopForm
                      shop={selectedShop}
                      onSubmit={(data) => onShopUpdate(selectedShopId, data)}
                    />
                  </Tab.Pane>
              },
              {
                menuItem: 'Филиалы',
                render: () =>
                  <Tab.Pane>
                    <ShopBranchesContainer
                      selectedShop={selectedShop}
                      segment={segment}
                    />
                  </Tab.Pane>
              },
              {
                menuItem: 'Категории магазина',
                render: () =>
                  <Tab.Pane>
                    <ShopCategoriesContainer
                      selectedShop={selectedShop}
                      segment={segment}
                    />
                  </Tab.Pane>
              },
            ]}
          />
        }
      </div>
    )
  }
}

export default ShopsListView
