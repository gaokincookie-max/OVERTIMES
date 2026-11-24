// 1地点につき1体。移動判定と確保を同じ同期処理で行う。
class Occupancy {
    constructor() { this.rooms = new Map(); }
    move(kind, destination) {
        const owner = this.rooms.get(destination);
        if (owner && owner !== kind) return false;
        this.release(kind);
        this.rooms.set(destination, kind);
        return true;
    }
    release(kind) {
        for (const [room, owner] of this.rooms) if (owner === kind) this.rooms.delete(room);
    }
    owner(room) { return this.rooms.get(room); }
}
