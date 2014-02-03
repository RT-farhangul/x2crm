<?php
 
/**
 * @package X2CRM.modules.groups
 */
class GroupsModule extends CWebModule {
	public function init() {
		// this method is called when the module is being created
		// you may place code here to customize the module or the application

		// import the module-level models and components
		$this->setImport(array(
			'groups.models.*',
			'groups.components.*',
			// 'application.controllers.*',
			'application.components.*',
		));
	}
}
