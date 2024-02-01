import { beforeEach, expect, describe, it } from 'vitest';

import { ResourceHttpController } from './api/httpControllers/resourceHttpController/resourceHttpController.js';
import { resourceSymbols } from './symbols.js';
import { Application } from '../../core/application.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';

describe('ResourceModule', () => {
  let container: DependencyInjectionContainer;

  beforeEach(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<ResourceHttpController>(resourceSymbols.resourceHttpController)).toBeInstanceOf(
      ResourceHttpController,
    );
  });
});
