import React from 'react'
import { Grid, Loader, Select, Table, Dimmer, Input, Container } from 'semantic-ui-react'

import { fetchAPI} from 'utils'
import PaginationMenu from 'components/atlas/PaginationMenu'
import TickersList from 'components/atlas/TickersList'


const PaginationSelect = ({ onChange, value }) =>
  <Select className="ui dropdown" onChange={(e, { value }) => onChange(value)} value={value} options={[
    {key: 50,  value: 50,  text: '50'},
    {key: 100, value: 100, text: '100'},
    {key: 150, value: 150, text: '150'},
  ]}/>

class ListContainer extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      initialized: false,
      loading: false,
      error: null,
      data: [],
      limit: 50,
      offset: 0,
      count: 0,
      checkboxes: {},
      sort:'',
    }
  }

  componentDidMount() {
    this.getData()
  }

  getData = async () => {
    const { limit, offset, sort, search } = this.state
    this.setState({loading: true})
    try{
      let response = await fetchAPI('/atlas', 'POST', {limit, offset, sort, search})
      const { data, count } = response
      this.setState({
        initialized: true,
        loading: false,
        data,
        count
      })
    } catch(err) {
      this.setState({loading: false, error: err})
    }
  }

  handleChangeSearch = (e,{value}) => {
    this.setState({ search: value })
  }

  handleChange = async (event) => {
    const { checkboxes } = this.state
    const { checked, name } = event.target
    this.setState({
      checkboxes: {
        ...checkboxes,
        [name]: checked,
      }
    })

    await fetchAPI('/atlas', 'PATCH', {
      ticker: name,
      enabled: checked
    })
  }

  handleChangeOffset = (value) => {
    this.setState({
      offset: value
    }, this.getData)
  }

  handleChangeLimit = (value) => {
    this.setState({
      limit: parseInt(value, 10),
      offset: 0
    }, this.getData)
  }

  handleChangeSort = (value) => {
    this.setState({
      sort: this.state.sort == value ? `-${value}` : value,
      offset: 0
    }, this.getData)
  }

  render() {
    const { initialized, loading, error, data, limit, offset, count, checkboxes, sort  } = this.state
    if (loading && !initialized) return <Loader active/>
    else if (error) return <div>Error: {error}</div>
    else if (!data) return <span/>
    return (
      <Container fluid>
        <Dimmer active={this.state.loading} inverted><Loader /></Dimmer>
        <h3>Валюты/Акции/Облигации</h3>
        <Grid>
          <Grid.Row>
            <Input 
              icon={{ name: 'search', circular: true, link: true, onClick: this.getData }}
              type="text"
              placeholder="Поиск"
              value={this.state.search}
              onChange={this.handleChangeSearch}
            />
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <PaginationMenu onChangeOffset={this.handleChangeOffset} {...{ count, limit, offset }} />
            </Grid.Column>
            <Grid.Column floated='right' width={2}>
              <PaginationSelect onChange={this.handleChangeLimit} value={limit} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <TickersList
              handleChange={this.handleChange}
              data={data}
              checkboxes={checkboxes}
              sort={sort}
              onChangeSort={this.handleChangeSort}
            />
            <Grid.Column floated='left'>
              <PaginationMenu onChangeOffset={this.handleChangeOffset} {...{ count, limit, offset }} />
            </Grid.Column>
            <Grid.Column floated='right' width={2}>
              <PaginationSelect onChange={this.handleChangeLimit} value={limit} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }
}

export default ListContainer
