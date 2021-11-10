module.exports = function Tracker(dispatch) {
	const command = dispatch.command;
	let timer = null;
	let charName = '';
	let timed = {
		7005 : 86400000,
		7006 : 86400000,
		7007 : 86400000,
		7008 : 86400000,
		7009 : 86400000
	}
	
	command.add('vgcd', ()=>{
		dispatch.settings.enabled = !dispatch.settings.enabled;
		command.message('Tracking VG CDs enabled? ' + dispatch.settings.enabled);
	})
	
	dispatch.hook('S_LOGIN', 14, (event , fake) => {
		charName = event.playerId + '-' + event.serverId;
	})
	
	dispatch.hook('S_LOAD_TOPO', 'raw', (event , fake) => {
		if(!dispatch.settings.enabled) return;
		let delay = 3000;
		if(dispatch.settings[charName])
			for(let x of Object.keys(dispatch.settings[charName]) ){
				if(dispatch.settings[charName][x].lastCompleted + timed[x] < Date.now() &&
				   ( !dispatch.settings[charName][x].lastWarned ||
					  Date.now() - dispatch.settings[charName][x].lastWarned > 1500000 ) ){
					setTimeout(()=>{
						dispatch.send('S_DUNGEON_EVENT_MESSAGE', 2, {
							type : 49,
							chat : false,
							channel : 0,
							message : 'Secret dungeon rewards are ready!\n Tier : ' + ( x - 7004 )
						})
					}, 10000 + delay)
					delay+= 5000;
					dispatch.settings[charName][x].lastWarned = Date.now();
				}
			}
	})
	
	dispatch.hook('C_COMPLETE_DAILY_EVENT', 1, { filter : { fake : null } } ,(event , fake) => {
		if(timed[event.id]){
			if(!dispatch.settings[charName]) dispatch.settings[charName] = {}
			if(!dispatch.settings[charName][event.id]) dispatch.settings[charName][event.id] = {}
			dispatch.settings[charName][event.id].lastCompleted = Date.now()
			dispatch.settings[charName][event.id].lastWarned = null;
		}
	})
	
}