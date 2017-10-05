/**
 upgrades
 Component that handles upgrades.

 @namespace Components
 */
'use strict';

angular.module('game').component('upgrades', {
  templateUrl: 'views/upgrades.html',
  controller: ['state', 'visibility', 'upgrade', 'data', upgrades],
  controllerAs: 'ct'
});

function upgrades(state, visibility, upgrade, data) {
  let ct = this;
  ct.state = state;
  ct.data = data;

  // tries to buy all the upgrades it can, starting from the cheapest
  ct.buyAll = function (slot) {
    let currency = data.elements[slot.element].main;
    let cheapest;
    let cheapestPrice;
    do{
      cheapest = null;
      cheapestPrice = Infinity;
      for(let up of ct.visibleUpgrades(slot, data.upgrades)){
        let price = data.upgrades[up].price;
        if(!slot.upgrades[up] &&
          price <= state.player.resources[currency].number){
          if(price < cheapestPrice){
            cheapest = up;
            cheapestPrice = price;
          }
        }
      }
      if(cheapest){
        upgrade.buyUpgrade(state.player,
          slot.upgrades,
          data.upgrades[cheapest],
          cheapest,
          cheapestPrice,
          currency);
      }
    }while(cheapest);
  };

  ct.buyUpgrade = function (name, slot) {
    let price = data.upgrades[name].price;
    let currency = data.elements[slot.element].main;
    upgrade.buyUpgrade(state.player,
      slot.upgrades,
      data.upgrades[name],
      name,
      price,
      currency);
  };

  /* Global upgrades are non-resource specific, repeatable upgrades */
  ct.buyGlobalUpgrade = function (name) {
    if (!ct.canBuyGlobalUpgrade(name)) {
      return;
    }

    let up = data.global_upgrades[name];
    for (let currency in up.price) {
      let value = up.price[currency] * ct.priceMultiplier(name);
      state.player.resources[currency].number -= value;
    }

    state.player.global_upgrades[name]++;
  };

  ct.canBuyGlobalUpgrade = function (name) {
    let up = data.global_upgrades[name];
    for (let currency in up.price) {
      let value = up.price[currency] * ct.priceMultiplier(name);
      if (state.player.resources[currency].number < value) {
        return false;
      }
    }

    return true;
  };

  ct.priceMultiplier = function (name) {
    let level = state.player.global_upgrades[name];
    return Math.ceil(Math.pow(data.global_upgrades[name].price_exp, level));
  };

  ct.visibleUpgrades = function(slot, source) {
    return visibility.visible(source, createVisibleFunction(source), slot);
  };

  function createVisibleFunction(source){
    return function isBasicUpgradeVisible(name, slot) {
      let isVisible = visibility.isUpgradeVisible(name, slot, source[name]);
      if(source === data.upgrades){
        return isVisible && (!state.hideBought || !slot.upgrades[name]);
      }
      return isVisible;
    };
  }
}
