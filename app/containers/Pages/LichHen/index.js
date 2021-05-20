import React, { Component, Fragment } from 'react';
import { Button, Table, Popconfirm, message, Card, Tooltip, } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { PAGINATION_CONFIG } from '@constants';
import { createStructuredSelector } from 'reselect';
import { makeGetLoading } from '@containers/App/AppProvider/selectors';
import { connect } from 'react-redux';
import Search from '@components/Search/Search';
import { stringify } from 'qs';
import queryString from 'query-string';
// import { fetchSanPham } from '@reduxApp/HoatDongSanXuat/actions';
import { makeGetMyInfo } from '../../Layout/HeaderComponent/HeaderProvider/selectors';
import { CONSTANTS } from '@constants';
import {getAll} from '@services/lichhen/lichhenService'
import axios from 'axios'
import { URL } from "../../../constants/URL";
import { Link } from 'react-router-dom';

class LichHen extends Component {

  columns = [

    {
      title: 'Ngày hẹn',
      dataIndex: 'ngayhen',
      width: 150,
      align: 'center',
    },
    {
      title: 'Ngày đặt lịch',
      dataIndex: 'created_at',
      width: 150,
      align: 'center',
    },
    {
      title: 'Loại lỗ',
      dataIndex: 'solo',
      width: 150,
      align: 'center',
    },
    {
      title: 'SÔ người chơi ',
      dataIndex: 'songuoichoi',
      width: 150,
      align: 'center',
    },
    {
      title: 'Hành động',
      render: (value) => this.formatActionCell(value),
      width: 150,
      align: 'center',
    },
  ];

  constructor(props) {
    super(props);
    this.state = {
      dataRes: [],
      dslichhen:[],

      page: 1,
      limit: 10,
      totalDocs: 0,
      data: null
    };
    this.formRef = React.createRef();
  }

  async componentDidMount() {
    let dataApi = await getAll(1, 0)
    if(dataApi){
      this.setState({dslichhen: dataApi.docs})
    }


    this.getDataFilter();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.location.search !== prevProps.location.search) {
      this.getDataFilter();
    }
  }

  async getDataFilter() {
    let search = queryString.parse(this.props.location.search);
    let page = parseInt(search.page ? search.page : this.state.page);
    let limit = parseInt(search.limit ? search.limit : this.state.limit);
    let queryStr = '';
    queryStr += `${search.hoten ? '&hoten[like]={0}'.format(search.hoten) : ''}`;
    queryStr += `${search.trangthai_id ? '&trangthai_id={0}'.format(search.trangthai_id) : ''}`;
    const apiResponse = await getAll(page, limit, queryStr);
    if (apiResponse) {
      const dataRes = apiResponse.docs;
      this.setState({
        dataRes,
        totalDocs: apiResponse.totalDocs,
        limit: apiResponse.limit,
        page: apiResponse.page,
      });
    }
  }

  async handleDelete(value) {
    const apiResponse = await delById(value._id);
    if (apiResponse) {
      this.getDataFilter();
      message.success('Xoá lịch hẹn thành công');
    }
  }


  formatActionCell(value) {
    return <>
      <Link to={URL.LICH_HEN_ID.format(value._id)}>
        <Tooltip title={'Xem chi tiết'} color="#2db7f5">
          <Button icon={<EyeOutlined/>} size='small' type="primary" className='mr-1'></Button>
        </Tooltip>
      </Link>

      <Popconfirm key={value._id} title="Bạn chắc chắn muốn xoá?"
                  onConfirm={() => this.handleDelete(value)}
                  cancelText='Huỷ' okText='Xoá' okButtonProps={{ type: 'danger' }}>
        <Tooltip placement="right" title={'Xóa dữ liệu'} color="#f50">
          { this.props.myInfoResponse.role === CONSTANTS.ADMIN? <Button icon={<DeleteOutlined/>} type='danger' size='small' className="mr-1"></Button> :''}
        </Tooltip>
      </Popconfirm>
    </>;
  }

  // showTrangThai(value){
  //   return <React.Fragment>
  //   {
  //     <div>{value.trangthai_id.tentrangthai} </div>
  //   }

  // </React.Fragment>
  // }

  // handleRefresh = (newQuery, changeTable) => {
  //   const { location, history } = this.props;
  //   const { pathname } = location;
  //   console.log(pathname,'pathname');
  //   console.log(location,'location');
  //   console.log(history,'history');
  //
  //   let { page, limit } = this.state;
  //   let objFilterTable = { page, limit };
  //   if (changeTable) {
  //     newQuery = queryString.parse(this.props.location.search);
  //     delete newQuery.page;
  //     delete newQuery.limit;
  //   }
  //   newQuery = Object.assign(objFilterTable, newQuery);
  //
  //   let query  = {idcongan:1111111}
  //   console.log(newQuery,'NEWQUERY');
  //   console.log(query,'query');
  //   console.log(stringify({...query}, { arrayFormat: 'repeat' }),'stringify({query}');
  //   console.log(stringify({...newQuery}, { arrayFormat: 'repeat' }),'stringify({query}');
  //   history.push({
  //     pathname, search: stringify({...query}, { arrayFormat: 'repeat' }),
  //   });
  // };

  handleRefresh = (newQuery, changeTable) => {
    const { location, history } = this.props;
    const { pathname } = location;
    let { page, limit } = this.state;
    let objFilterTable = { page, limit };
    if (changeTable) {
      newQuery = queryString.parse(this.props.location.search);
      delete newQuery.page;
      delete newQuery.limit;
    }
    newQuery = Object.assign(objFilterTable, newQuery);
    let query  = {idcongan:1111111}
    history.push({
      pathname, search: stringify({...newQuery}, { arrayFormat: 'repeat' }),
    });
  };

  onChangeTable = (page) => {
    this.setState({ page: page.current, limit: page.pageSize },
      () => {
        this.handleRefresh({}, true);
      });
  };

  getDataAfterSave = (data, type) => {
    // type = ADD thêm mới.
    if(type === 'ADD'){
      this.getDataFilter();
    }else if(type === 'UPDATE'){
      const dataRes = this.state.dataRes.map(curr => {
        if (data._id === curr._id) {
          return data
        }
        return curr;
      });
      this.setState({ dataRes });
    }
  }

  // showTrangThai(value){
  //   return <React.Fragment>
  //   {
  //     <div>{value.tentrangthai} </div>
  //   }

  // </React.Fragment>
  // }

  render() {
    const { loading } = this.props;
    const { dataRes, totalDocs, page, limit, dslichhen } = this.state;
    const dataSearch = [{
      type: 'text',
      operation: 'like',
      name: 'hoten',
      label: 'Họ tên',
    },
    { type: 'select',
    name: 'trangthai_id',
    label: 'Trạng thái',
    options: dslichhen,
    key: '_id',
    value: 'tentrangthai'}

  ];
    return <div>


<Card size="small" title={<span>
        <UnorderedListOutlined className="icon-card-header"/> &nbsp;Danh sách LichHen
      </span>}
      md="24"
      bordered extra={
      <Link to={URL.LICH_HEN_ADD}>
        {this.props.myInfoResponse.role === CONSTANTS.ADMIN ?   <Button type="primary" className='pull-right' size="small" icon={<PlusOutlined/>}>Thêm</Button> : ''}

      </Link>
    }
    >
        <Search onFilterChange={this.handleRefresh} dataSearch={dataSearch}/>
        <Table loading={loading} bordered columns={this.columns} dataSource={dataRes}
               size="small" rowKey="_id"
               pagination={{
                 ...PAGINATION_CONFIG,
                 current: page,
                 pageSize: limit,
                 total: totalDocs,
               }}
               onChange={this.onChangeTable}/>
      </Card>
    </div>;
  }
}

const mapStateToProps = createStructuredSelector({
  loading: makeGetLoading(),
  myInfoResponse: makeGetMyInfo(),

});

const withConnect = connect(mapStateToProps);

export default withConnect(LichHen);
