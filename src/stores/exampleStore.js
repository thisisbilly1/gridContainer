import { defineStore } from 'pinia';

export const useExampleStore = defineStore({
  id: 'exampleStore',
  state: () => ({
    settings: null,
    settingsPromise: null,
  }),
  actions: {
    hydrate() {
      const userString = localStorage.getItem('exampleStore');
      if (userString) {
        const userObj = JSON.parse(userString);
        this.settings = userObj.settings;
      } else {
        this.settings = {};
      }
    },
    saveLocalStorage() {
      // set the local storage so that we load fast AF for next time
      const saveObj = {
        settings: this.settings,
      }
      localStorage.setItem('exampleStore', JSON.stringify(saveObj));
    },
    async updateSettings({ name, settingName, value }) {
      if (typeof this.settings === Promise) return;
      try {
        // put your api call here
        this.settings[`${name}/${settingName}`] = value;
        this.saveLocalStorage();
        return true;
      } catch (error) {
        console.error('ERROR WITH UPDATING GRID SETTINGS', error);
        return false;
      }
    },
    async deleteSettings({ name, settingName }) {
      if (typeof this.settings === Promise) return;
      try {
        // put your api call here
        delete this.settings[`${name}/${settingName}`]
        this.saveLocalStorage();
        return true;
      } catch (error) {
        console.error('ERROR WITH DELETING REPORTS SETTINGS', error);
        return false;
      }
    },
    async getSettings({ name, settingName }) {
      if (!this.settings) this.hydrate();
      // preload your settings here
      // if (!this.settingsPromise) {
      //   this.settingsPromise = getConfigAPI().then(settings => {
      //     this.settings = settings;
      //     this.saveLocalStorage();
      //   });
      // }
      // if (this.settingsPromise && !this.settings) await this.settingsPromise;
      return this.settings?.[`${name}/${settingName}`];
    },
  },
});
