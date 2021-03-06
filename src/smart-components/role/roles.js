import React, { Fragment, useState, useEffect } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { Link, Route, Switch, useHistory } from 'react-router-dom';
import { cellWidth, nowrap, sortable } from '@patternfly/react-table';
import { Button, Stack, StackItem } from '@patternfly/react-core';
import { createRows } from './role-table-helpers';
import { mappedProps } from '../../helpers/shared/helpers';
import { fetchRolesWithPolicies } from '../../redux/actions/role-actions';
import { TopToolbar, TopToolbarTitle } from '../../presentational-components/shared/top-toolbar';
import { TableToolbarView } from '../../presentational-components/shared/table-toolbar-view';
import AddRoleWizard from './add-role-new/add-role-wizard';
import RemoveRole from './remove-role-modal';
import { Section } from '@redhat-cloud-services/frontend-components';
import Role from './role';
import { routes as paths } from '../../../package.json';
import EditRole from './edit-role-modal';
import './roles.scss';
import PageActionRoute from '../common/page-action-route';

const columns = [
  { title: 'Name', key: 'name', transforms: [cellWidth(20), sortable] },
  { title: 'Description' },
  { title: 'Permissions', transforms: [nowrap] },
  { title: 'Groups', transforms: [nowrap] },
  { title: 'Last modified', key: 'modified', transforms: [nowrap, sortable] },
];

const selector = ({ roleReducer: { roles, isLoading } }) => ({
  roles: roles.data,
  pagination: roles.meta,
  userIdentity: roles.identity,
  isLoading,
});

const Roles = () => {
  const [filterValue, setFilterValue] = useState('');
  const dispatch = useDispatch();
  const { push } = useHistory();
  const { roles, isLoading, pagination, userIdentity } = useSelector(selector, shallowEqual);
  const fetchData = (options) => dispatch(fetchRolesWithPolicies(options));

  useEffect(() => {
    insights.chrome.appNavClick({ id: 'roles', secondaryNav: true });
    fetchData({ ...pagination, name: filterValue });
  }, []);

  const routes = () => (
    <Fragment>
      <Route exact path={paths['add-role']} component={AddRoleWizard} />
      <Route exact path={paths['remove-role']}>
        {!isLoading && (
          <RemoveRole
            routeMatch={paths['remove-role']}
            cancelRoute={paths.roles}
            afterSubmit={() => fetchData({ ...pagination, name: filterValue })}
          />
        )}
      </Route>
      <Route exact path={paths['edit-role']}>
        {!isLoading && (
          <EditRole afterSubmit={() => fetchData({ ...pagination, name: filterValue })} routeMatch={paths['edit-role']} cancelRoute={paths.roles} />
        )}
      </Route>
    </Fragment>
  );

  const actionResolver = ({ system }) => {
    return system
      ? []
      : [
          {
            title: 'Edit',
            onClick: (_event, _rowId, role) => push(`/roles/edit/${role.uuid}`),
          },
          {
            title: 'Delete',
            onClick: (_event, _rowId, role) => push(`/roles/remove/${role.uuid}`),
          },
        ];
  };

  const toolbarButtons = () =>
    [
      <Fragment key="add-role">
        {userIdentity?.user?.is_org_admin ? (
          <Link to={paths['add-role']}>
            <Button ouiaId="create-role-button" variant="primary" aria-label="Create role" className="pf-m-visible-on-md">
              Create role
            </Button>
          </Link>
        ) : (
          <Fragment />
        )}
      </Fragment>,
      userIdentity?.user?.is_org_admin
        ? {
            label: 'Create role',
            props: {
              className: 'pf-m-hidden-on-md',
            },
            onClick: () => {
              push(paths['add-role']);
            },
          }
        : undefined,
    ].filter((x) => x);

  const renderRolesList = () => (
    <Stack>
      <StackItem>
        <TopToolbar>
          <TopToolbarTitle title="Roles" />
        </TopToolbar>
      </StackItem>
      <StackItem>
        <Section type="content" id={'tab-roles'}>
          <TableToolbarView
            actionResolver={actionResolver}
            columns={columns}
            createRows={createRows}
            data={roles}
            filterValue={filterValue}
            fetchData={(config) => fetchData(mappedProps(config))}
            setFilterValue={({ name }) => setFilterValue(name)}
            isLoading={isLoading}
            pagination={pagination}
            routes={routes}
            ouiaId="roles-table"
            titlePlural="roles"
            titleSingular="role"
            toolbarButtons={toolbarButtons}
            filterPlaceholder="name"
          />
        </Section>
      </StackItem>
    </Stack>
  );

  return (
    <Switch>
      <PageActionRoute pageAction="role-detail" path={paths['role-detail']}>
        <Role />
      </PageActionRoute>
      <PageActionRoute pageAction="roles-list" path={paths.roles} render={() => renderRolesList()} />
    </Switch>
  );
};

export default Roles;
