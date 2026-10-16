// One shared system record: ownership and session roles are independent.
export function playerSessions(system){return system.sessions.filter(session=>session.role==='player')}
export function playerSystems(systems,showOwned=false){return systems.filter(system=>(!system.owned||playerSessions(system).length>0)&&(showOwned||!system.owned))}
