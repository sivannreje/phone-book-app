'use strict';

angular.module('phoneBookApp.version', [
  'phoneBookApp.version.interpolate-filter',
  'phoneBookApp.version.version-directive'
])

.value('version', '0.1');
