// npm run test:unit:noreport src/projects/security/components/grid/ColumnGroups.spec.js --
import Vue from 'vue';
import Vuetify from 'vuetify';
import { mount, createLocalVue } from '@vue/test-utils';
import ColumnGroups from './ColumnGroups.vue';
Vue.use(Vuetify);
describe('ColumnGroups', () => {
  const localVue = createLocalVue();
  const vuetify = new Vuetify();
  const wrapper = mount(ColumnGroups, {
    localVue,
    vuetify,
    propsData: {
      columnGroups: [
        { name: 'craig', columns: [1, 2, 3] },
        { name: 'wanda', columns: [4, 5, 6] }
      ],
      defaultColumns: [3, 2],
    },
  });
  it('Test Render', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.vm.$options.name).toMatch('ColumnGroups');
  });
  it('Test Validator', () => {
    let validator = ColumnGroups.props.columnGroups.validator
    expect(validator([
      { name: 'craig', columns: [1, 2, 3] }
    ])).toBeTruthy()
    expect(validator([
      { name: 'craig', cols: [1, 2, 3] }
    ])).toBe(false)

  })
  it('emits properly', () => {
    wrapper.vm.changeColGroup(1)
    expect(wrapper.emitted().change[1][0]).toEqual({ name: 'craig', columns: [1, 2, 3] })
  })
});