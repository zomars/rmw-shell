import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { setSimpleValue } from '../../store/simpleValues/actions';
import { withRouter } from 'react-router-dom';
import FontIcon from 'material-ui/FontIcon';
import { withFirebase } from 'firekit-provider'
import { ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';
import Toggle from 'material-ui/Toggle';
import ReactList from 'react-list';
import { List } from 'material-ui/List';
import { FilterDrawer, filterSelectors, filterActions } from 'material-ui-filter'
import withAppConfigs from '../../withAppConfigs'
import { getList } from 'firekit'

export class RoleGrants extends Component {

	componentWillMount() {
		const { watchList, setSearch } = this.props;
		watchList('role_grants')
		setSearch('role_grants', '')
	}

	handleGrantToggleChange = (e, isInputChecked, key) => {
		const { firebaseApp, match } = this.props;
		const uid = match.params.uid;

		if (isInputChecked) {
			firebaseApp.database().ref(`/role_grants/${uid}/${key}`).set(true);
		} else {
			firebaseApp.database().ref(`/role_grants/${uid}/${key}`).remove();
		}

	}

	renderGrantItem = (list, i, k) => {
		const { user_grants, match, intl, appConfig } = this.props

		const uid = match.params.uid
		const key = list[i].key
		const val = appConfig.grants[list[i].key]
		let userGrants = []

		if (user_grants !== undefined) {
			user_grants.map(role => {
				if (role.key === uid) {
					if (role.val !== undefined) {
						userGrants = role.val
					}
				}
				return role
			})
		}

		return <div key={key}>
			<ListItem
				leftAvatar={
					<Avatar
						alt="person"
						src={undefined}
						icon={<FontIcon className="material-icons" >checked</FontIcon>}
					/>
				}
				rightToggle={
					<Toggle
						toggled={userGrants[val] === true}
						onToggle={(e, isInputChecked) => { this.handleGrantToggleChange(e, isInputChecked, val) }}
					/>
				}
				key={key}
				id={key}
				primaryText={intl.formatMessage({ id: `grant_${val}` })}
				secondaryText={val}
			/>
			<Divider inset={true} />
		</div>;
	}

	render() {
		const { intl, filters, appConfig } = this.props;

		let grantList = []
		appConfig.grants.forEach((grant, index) => {
			grantList.push({ key: index, val: { name: intl.formatMessage({ id: `grant_${grant}` }), value: grant } })
		})

		const list = filterSelectors.getFilteredList('role_grants', filters, grantList, fieldValue => fieldValue.val)

		const filterFields = [
			{
				name: 'name',
				label: intl.formatMessage({ id: 'name_label' })
			},
			{
				name: 'value',
				label: intl.formatMessage({ id: 'value_label' })
			}
		]

		return (
			<div style={{ height: '100%' }}>
				<List style={{ height: '100%' }} ref={(field) => { this.list = field; }}>
					<ReactList
						itemRenderer={(i, k) => this.renderGrantItem(list, i, k)}
						length={list ? list.length : 0}
						type='simple'
					/>
				</List>
				<FilterDrawer
					name={'role_grants'}
					fields={filterFields}
					formatMessage={intl.formatMessage}
				/>
			</div>
		);
	}
}


RoleGrants.propTypes = {
	intl: intlShape.isRequired,
	muiTheme: PropTypes.object.isRequired,
	match: PropTypes.object.isRequired,
};


const mapStateToProps = (state, ownProps) => {
	const { auth, intl, lists, filters } = state;
	const { match } = ownProps

	const uid = match.params.uid

	return {
		filters,
		auth,
		uid,
		intl,
		user_grants: getList(state, 'role_grants')
	}
}

export default connect(
	mapStateToProps, { setSimpleValue, ...filterActions }
)(injectIntl(withRouter(withFirebase(withAppConfigs(muiThemeable()(RoleGrants))))))
