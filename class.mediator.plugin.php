<?php if (!defined('APPLICATION')) exit();

/* Mediator Plugin for Vanilla Forums by Seon-Wook Park | CC BY-NC-SA */

$PluginInfo['Mediator'] = array(
	'Name' => 'Mediator',
	'Description' => 'Allows automatic embedding of media by converting media links to embed code. Supports Youtube, Vimeo, Imgur, Pastebin, Soundcloud [Bandcamp].',
	'Version' => '0.1.42',
	'Date' => '12 Nov 2012',
	'Author' => 'Seon-Wook Park',
	'AuthorEmail' => 'seon.wook@swook.net',
	'AuthorUrl' => 'http://www.swook.net/',
	'RequiredApplications' => False,
	'RequiredTheme' => False, 
	'RequiredPlugins' => False,
	'RegisterPermissions' => False,
	'SettingsPermission' => False,
	'License' => 'CC BY-NC-SA'
);

class MediatorPlugin implements Gdn_IPlugin {
	
	//public function DiscussionController_Render_Before($Sender) {
	public function Base_Render_Before(&$Sender) {
		if ($Sender->DeliveryType() == DELIVERY_TYPE_ALL && $Sender->SyndicationMethod == SYNDICATION_NONE) {
			$Sender->AddJsFile('plugins/Mediator/mediator.js');
			$Sender->AddCssFile('plugins/Mediator/design/style.css');
		}
	}

    public function Setup() {
    }
}
