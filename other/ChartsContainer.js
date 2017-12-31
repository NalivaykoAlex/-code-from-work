import React from 'react'
import moment from 'moment'
import { Grid, Dropdown, Form, Button, Dimmer, Loader, Input } from 'semantic-ui-react'
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker'
import 'bootstrap-daterangepicker/daterangepicker.css'

import { fetchAPI, setHash, getHash } from 'utils'
import AsyncDropdownField from 'components/common/AsyncDropdownField'


const getResolutionName = (value) => {
  let names = {
    '1': 'Минуты',
    '60': 'Часы',
    'D': 'Дни',
    'W': 'Недели',
    'M': 'Месяцы',
  }
  return names[value] || 'Неизвестно'
}


const TickerSelect = ({ value, onChange, type }) =>
  <AsyncDropdownField
    placeholder='Любое'
    value={value}
    onChange={onChange}
    entityURL='/atlas/'
    searchField='shortname'
    additionalFilters={{ type: type }}
    getKey={item => item._id}
    getText={item => `${item.shortname} (${item.shortdescription})`}
    getValue={item => item._id}
  />


const IntervalSelect = ({ value, onChangeResolution }) => (
  <Button.Group size='small'>
    <Button active={value == '1'}  onClick={onChangeResolution.bind(this, '1')}>Минута</Button>
    <Button active={value == '60'} onClick={onChangeResolution.bind(this, '60')}>Час</Button>
    <Button active={value == 'D'}  onClick={onChangeResolution.bind(this, 'D')}>День</Button>
    <Button active={value == 'W'}  onClick={onChangeResolution.bind(this, 'W')}>Неделя</Button>
    <Button active={value == 'M'}  onClick={onChangeResolution.bind(this, 'M')}>Месяц</Button>
  </Button.Group>
)


const TickerTypeSelect = ({ value, onChange }) =>
  <Dropdown
    placeholder='Выберите' fluid selection options={[
      {key: 'bonds', text: 'Акции',     value: 'stock'},
      {key: 'stock', text: 'Облигации', value: 'bonds'},
      {key: 'forex', text: 'Валюта',    value: 'forex'},
    ]}
    value={value}
    onChange={onChange}
  />


class TickerCharts extends React.PureComponent {
  constructor(props) {
    super(props)
    let hash = getHash()
    this.state = {
      data: {},
      ticker_info: null,
      loading: false,
      chartData: [],
      resolution: hash.resolution || 'D',
      date_from: hash.date_from || moment().subtract(1, 'months').format('X'),
      date_to: hash.date_to || moment().format('X'),
      ranges: {
        'Сегодня': [moment(), moment()],
        'Вчера': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Последние 7 дней': [moment().subtract(6, 'days'), moment()],
        'Последние 30 дней': [moment().subtract(29, 'days'), moment()],
        'За этот месяц': [moment().startOf('month'), moment().endOf('month')],
        'За прошлый месяц': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
      }
    }
  }


  componentDidMount() {
    this.loadData()
  }

  loadData = async () => {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
    this.setState({ loading: true, data: {} })
    let data = await fetchAPI(`/atlas/ticker_history?symbol=${this.props.ticker}&resolution=${this.state.resolution}&from=${this.state.date_from}&to=${this.state.date_to}`)
    let ticker_info = await fetchAPI(`/atlas/${this.props.ticker}`)
    this.setState({ data, ticker_info, loading: false }, this.updateChart) 
  }

  handleChangeResolution = (value) => {
    let hash = getHash()
    hash.resolution = value
    setHash(hash)
    this.setState({ resolution: value }, this.loadData)
  }

  handleApply = (event, picker) => {
    let hash = getHash()
    hash.date_from = picker.startDate.format('X')
    hash.date_to = picker.endDate.format('X')
    setHash(hash)
    this.setState({
      date_from: picker.startDate.format('X'),
      date_to: picker.endDate.format('X'),
    }, this.loadData)
  }

  updateChart = () => {
    let data = this.state.data
    let chartData = []
    let chartVolume = []
    for (let i = 0; i < data.t.length; i++) {
      chartData.push([data.t[i] * 1000, data.o[i], data.h[i], data.l[i], data.c[i]])
      chartVolume.push([data.t[i] * 1000, data.v[i]*1000]) 
    } 
    this.setState({
      chartData: chartData
    }, () => {
      if (!chartData.length) return
      Highcharts.setOptions({
        lang: {
          shortMonths: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        },
      }),
        this.chart = Highcharts.stockChart('chart', {
          exporting: {
            fallbackToExportServer: false,
            filename: `${(this.state.ticker_info.shortdescription)} - ${getResolutionName(this.state.resolution)} - ${moment(this.state.date_from, 'X').format('DD-MM-YYYY HH:mm')} - ${moment(this.state.date_to, 'X').format('DD-MM-YYYY HH:mm')}`,
          },
          title: {
            text: `${getResolutionName(this.state.resolution)} - ${moment(this.state.date_from, 'X').format('DD-MM-YYYY HH:mm')} - ${moment(this.state.date_to, 'X').format('DD-MM-YYYY HH:mm')} - ${(this.state.ticker_info.shortdescription)}`
          },
          yAxis: [
            {
              labels: {
                align: 'right',
                x: 8,
              },
              height: '60%',
              lineWidth: 2
            }, {
              labels: {
                align: 'right',
                x: 8
              },
              top: '65%',
              height: '35%',
              offset: 0,
              lineWidth: 2
            },
          ],
          buttons: {
            exportButton: {
              enabled: false
            },
            printButton: {
              enabled: false
            }
          },
          chart: {
            renderTo: 'container',
            type: 'column'
          },
          plotOptions: {
            area: {
              stacking: 'normal',
              lineColor: '#666666',
              lineWidth: 1,
              marker: {
                radius: 2
              }
            }
          },
          tooltip: {
            split: true,
          },
          series: [{
            type: 'candlestick',
            data: chartData,
            pointStart: Date.UTC(2012, 0, 1),
            tooltip: {
              headerFormat: '<span style="font-weight: bold">{point.x:%d.%m.%Y.%H:%M}</span><br/>',
              pointFormat: 'High: <b>{point.high}</b><br/>Low: <b>{point.low}</b><br/>Open: <b>{point.open}</b><br/>Close: <b>{point.close}</b><br>'
            },
          },
          {
            type: 'column',
            data: chartVolume,
            yAxis: 1,
            tooltip: {
              pointFormat: 'Volume: <b>{point.y}</b>'
            }
          }
          ],
          rangeSelector: {
            enabled: false
          },
          credits: {
            enabled: false
          }
        })
    })
  }

  render() {
    let start = moment(this.state.date_from, 'X')
    let end = moment(this.state.date_to, 'X')
    let label = start.format('DD-MM-YYYY HH:mm') + ' - ' + end.format('DD-MM-YYYY HH:mm')
    if (start === end) {
      label = start
    }
    let locale = {
      format: 'DD-MM-YYYY HH:mm',
      separator: ' - ',
      applyLabel: 'Применить',
      cancelLabel: 'Отменить',
      weekLabel: 'W',
      customRangeLabel: 'Выбор в ручную',
      daysOfWeek: moment.weekdaysMin(),
      monthNames: moment.monthsShort(),
      firstDay: moment.localeData().firstDayOfWeek(),
    }
    return (
      <div ref='abc' style={{ width: '100%' }}>
        <Dimmer active={this.state.loading} inverted><Loader /></Dimmer>
        <div>
          <DatetimeRangePicker style={{ float: 'right' }}
            timePicker
            timePicker24Hour
            showDropdowns
            locale={locale}
            startDate={start}
            endDate={end}
            onApply={this.handleApply}
            ranges={this.state.ranges}
            opens='left'
          >
            <div>
              <Input style={{ float: 'right', width: '270px' }} type="text" value={label} />
            </div>
          </DatetimeRangePicker>
        </div>
        <div><IntervalSelect onChangeResolution={this.handleChangeResolution} value={this.state.resolution} /></div>
        {!this.state.chartData.length ? 'Нет данных' : <div ref='chart' id='chart' style={{ width: '100%', height: '500px' }} />}
      </div>
    )
  }
}

class TickerChartsContainer extends React.Component {
  constructor(props) {
    super(props)
    let hash = getHash()
    this.state = {
      ticker: hash.ticker || '',
      type: hash.type || '',
    }
  }

 
  handleChangeType = (e, { value }) => {
    this.setState({ type: '' }, () => this.setState({ type: value }))
    let hash = getHash()
    hash.type = value
    delete hash.ticker
    setHash(hash)
  }

  handleChangeTicker = (value) => {
    this.setState({ ticker: '' }, () => this.setState({ ticker: value }))
    let hash = getHash()
    hash.ticker = value
    setHash(hash)
  }

  render() {
    const { type, ticker, resolution } = this.state
    return (
      <div>
        <h3>График по валютам/акциям/облигациям</h3>
        <Form>
          <Form.Group widths='2'>
            <Form.Field>
              <label>Тип</label>
              <TickerTypeSelect value={type} onChange={this.handleChangeType} />
            </Form.Field>
            {type &&
              <Form.Field>
                <label>Тикер</label>
                <TickerSelect type={type} value={this.state.ticker} onChange={this.handleChangeTicker}/>
              </Form.Field>}
          </Form.Group>
        </Form>
      {type && ticker && <TickerCharts ticker={ticker}/>}
      </div>
    )
  }
}

export default TickerChartsContainer
