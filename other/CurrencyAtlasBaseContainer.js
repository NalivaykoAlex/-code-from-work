import React from 'react'
import { Card, Header } from 'semantic-ui-react'
import { Switch, Route } from 'react-router-dom'

import TickersListContainer from './TickersListContainer'
import LinkCard from 'components/common/LinkCard'
import ChartsContainer from './ChartsContainer'

const HomeHeader = ({ match }) =>
  <div>
    <Header>Атлас валют</Header>
    <Card.Group>
      <LinkCard link={{
        to: `${match.url}/aio`,
        name: 'Валюты/Акции/Облигации',
        icon: 'dollar',
        description: 'Просмотр и управление выдачей валют,акций,облигаций'
      }} />
    </Card.Group>
    <Card.Group>
      <LinkCard link={{
        to: `${match.url}/charts`,
        name: 'График по валютам/акциям/облигациям',
        icon: 'line graph',
        description: 'Просмотр данных за определенный период времени'
      }} />
    </Card.Group>
  </div>
  

export default ({ match }) =>
  <div>
    <Switch>
      <Route exact path={`${match.url}/`} component={HomeHeader}/>
      <Route exact path={`${match.url}/aio`} component={TickersListContainer}/>
      <Route exact path={`${match.url}/charts`} component={ChartsContainer}/>
    </Switch>
  </div>
