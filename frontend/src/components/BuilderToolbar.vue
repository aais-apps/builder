<template>
	<div
		class="toolbar border-outline border-outline flex items-center justify-center border-b-[1px] border-outline-gray-2 bg-surface-base px-2 py-1 dark:border-outline-gray-1"
		ref="toolbar">
		<div class="absolute left-3 flex items-center gap-4">
			<component
				v-for="item of itemsIn('left')"
				:key="item.name"
				:is="item.component"
				v-bind="item.props?.()" />
		</div>
		<div class="flex items-center gap-2">
			<component
				v-for="item of itemsIn('center')"
				:key="item.name"
				:is="item.component"
				v-bind="item.props?.()" />
		</div>
		<div class="absolute right-3 flex items-center gap-4">
			<component
				v-for="item of itemsIn('right')"
				:key="item.name"
				:is="item.component"
				v-bind="item.props?.()" />
		</div>

		<Dialog v-model="builderStore.showSettingsDialog" :dismissable="false" size="5xl" bare>
			<template #default>
				<DialogTitle class="sr-only">{{ __("Builder Settings") }}</DialogTitle>
				<DialogDescription class="sr-only">
					{{ __("Configure page and global settings for this project.") }}
				</DialogDescription>
				<BuilderSettings
					:initial-tab="builderStore.settingsActiveTab"
					@close="builderStore.showSettingsDialog = false"></BuilderSettings>
			</template>
		</Dialog>
	</div>
</template>
<script setup lang="ts">
import { __ } from "@/translation";
import Dialog from "@/components/Controls/Dialog.vue";
import { toolbarItems, type ToolbarRegion } from "@/components/ToolbarItems";
import useBuilderStore from "@/stores/builderStore";
import { DialogDescription, DialogTitle } from "reka-ui";
import { defineAsyncComponent, ref } from "vue";

const BuilderSettings = defineAsyncComponent(() => import("./BuilderSettings.vue"));

const builderStore = useBuilderStore();

const itemsIn = (region: ToolbarRegion) =>
	toolbarItems.visible.value.filter((item) => item.region === region);

const showInfoDialog = ref(false);
</script>
