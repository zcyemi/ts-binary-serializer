import { DataType } from "../src/DataType";
import { SerializeField } from "../src/SerializeField";
import * as fs from "fs";
import { BinarySerializer } from "../src/BinarySerializer";
import { verfiy } from "./helper.test";

describe("largedata", () => {
    var buffer = fs.readFileSync("./testdata/prefab.json");
    var jstr = buffer.toString();
    var jobj = <GameObjectInfo>JSON.parse(jstr);
    it("case", () => {

        let sd= BinarySerializer.Serialize(jobj,GameObjectInfo);
        let jobjd= BinarySerializer.Deserialize(sd,GameObjectInfo);
        
        verfiy(jobjd,jobj);
    });
})


class Vector2 {
    @SerializeField(DataType.Float32)
    x: number;
    @SerializeField(DataType.Float32)
    y: number;

    constructor(x?: number, y?: number) {
        if (x)
            this.x = x;
        else
            this.x = 0;

        if (y)
            this.y = y;
        else
            this.y = 0;
    }
}

class Vector3 {
    @SerializeField(DataType.Float32)
    x: number;
    @SerializeField(DataType.Float32)
    y: number;
    @SerializeField(DataType.Float32)
    z: number;


    constructor(x?: number, y?: number, z?: number) {
        if (x)
            this.x = x;
        else
            this.x = 0;

        if (y)
            this.y = y;
        else
            this.y = 0;

        if (z)
            this.z = z;
        else
            this.z = 0;
    }
}

class Color {
    @SerializeField(DataType.Float32)
    r: number;
    @SerializeField(DataType.Float32)
    g: number;
    @SerializeField(DataType.Float32)
    b: number;
    @SerializeField(DataType.Float32)
    a: number;
}

class Frame {
    @SerializeField(DataType.Float32)
    time: number;
    @SerializeField(DataType.Float32)
    val: number;
    @SerializeField(DataType.String)
    str: string;
}

class Sprite {
    @SerializeField(DataType.String)
    spriteName: string;
    @SerializeField(DataType.Object, false, Color)
    spriteTint: Color;
    @SerializeField(DataType.Object, false, Vector2)
    spritePivot: Vector2;
    @SerializeField(DataType.Bool)
    flipX: boolean;
    @SerializeField(DataType.Bool)
    flipY: boolean;
}

class State {
    @SerializeField(DataType.String)
    name: string;
    @SerializeField(DataType.String)
    aniName: string;
    @SerializeField(DataType.String, true)
    nextStates: Array<string>;

    public constructor(info: State) {
        this.name = info.name;
        this.aniName = info.aniName;
        this.nextStates = info.nextStates;
    }
}

class Curve {
    @SerializeField(DataType.String)
    aim: string;
    @SerializeField(DataType.String)
    type: string;
    @SerializeField(DataType.Object, true, Frame)
    frames: Array<Frame>;

    private framesDic: { [key: number]: number | string } = {}

    public constructor(info: Curve) {
        // this.aim = info.aim;
        // this.type = info.type;
        // this.frames = info.frames;
    }
}

class Event {
    @SerializeField(DataType.Float32)
    time: number;
    @SerializeField(DataType.String)
    functionName: string;
}

class Clip {
    @SerializeField(DataType.String)
    name: string;
    @SerializeField(DataType.Object, true, Curve)
    curves: Array<Curve>;
    @SerializeField(DataType.Object, true, Event)
    events: Array<Event>;
    @SerializeField(DataType.Bool)
    loop: boolean;
    @SerializeField(DataType.Int16)
    private frameCount: number;

    public constructor(info: Clip) {
        this.name = info.name;
        this.curves = new Array<Curve>();

        for (let i = 0; i < info.curves.length; i++)
            this.curves.push(new Curve(info.curves[i]));
    }
}

class Animation {
    @SerializeField(DataType.Object, true, Clip)
    animClips: Array<Clip>;
    @SerializeField(DataType.Object, true, State)
    states: Array<State>;
    @SerializeField(DataType.String)
    defaultState: string = "";
}

class Text {
    @SerializeField(DataType.String)
    text: string;
    @SerializeField(DataType.Object, false, Color)
    txtTint: Color;
    @SerializeField(DataType.Int16)
    size: number;
    @SerializeField(DataType.Int16)
    pivot: number;
    @SerializeField(DataType.Float32)
    width: number;
    @SerializeField(DataType.Float32)
    height: number;
}

class Node {
    @SerializeField(DataType.String)
    name: string;
    @SerializeField(DataType.Object, false, Vector3)
    position: Vector3;
    @SerializeField(DataType.Object, false, Vector3)
    scale: Vector3;
    @SerializeField(DataType.Float32)
    rotation: number;
    @SerializeField(DataType.Bool)
    active: boolean;
    @SerializeField(DataType.String, true)
    children: Array<string>;
    @SerializeField(DataType.Object, false, Sprite)
    sprite: Sprite;
    @SerializeField(DataType.Object, false, Text)
    txt: Text;
}

class GameObjectInfo {
    @SerializeField(DataType.String)
    root: string;
    @SerializeField(DataType.Object, true, Node)
    nodes: Array<Node>;
    @SerializeField(DataType.Object, false, Animation)
    anim: Animation;
    @SerializeField(DataType.String, true)
    components: Array<string>;
    @SerializeField(DataType.Object, true, Vector2)
    colliderPoly: Array<Vector2>;
}

class SprExInfo {
    @SerializeField(DataType.String)
    name: string;
    @SerializeField(DataType.Object, false, Vector2)
    pivot: Vector2;
    @SerializeField(DataType.Float32)
    pixelPerUnit: number;
}

class SprExtraInfo {
    @SerializeField(DataType.Object, true, SprExInfo)
    infos: SprExInfo[];
}

class StaticItemVO {
    @SerializeField(DataType.Float32)
    public m_entity: number;
    @SerializeField(DataType.Float32)
    public m_type: number;
    @SerializeField(DataType.String)
    public m_roomID: string;
    @SerializeField(DataType.Float32)
    public m_status: number;
    @SerializeField(DataType.Float32)
    public m_dir: number;
    @SerializeField(DataType.Float32)
    public m_x: number;
    @SerializeField(DataType.Float32)
    public m_y: number;
    @SerializeField(DataType.Float32)
    public m_width: number;
    @SerializeField(DataType.Float32)
    public m_height: number;
    @SerializeField(DataType.Float32)
    public m_zOrder: number;
    @SerializeField(DataType.Bool)
    public m_block: boolean;
    @SerializeField(DataType.Bool)
    public m_enable: boolean;
    @SerializeField(DataType.Bool)
    public m_visible: boolean;
}


class TileWallVO {
    @SerializeField(DataType.Float32)
    public m_type: number; // 1, 3, 7, 9  =>  BL, BR, TL, TR 
    @SerializeField(DataType.Float32)
    public m_entity: number;
}

class TileVO {
    @SerializeField(DataType.Float32)
    public m_x: number;
    @SerializeField(DataType.Float32)
    public m_y: number;
    @SerializeField(DataType.Float32)
    public m_btEntity: number;
    @SerializeField(DataType.Float32)
    public m_upEntity: number;

    // if block is true, cat can not move to. (still can place static items)
    @SerializeField(DataType.Bool)
    public m_block: boolean;
    @SerializeField(DataType.Float32)
    public m_blockID: number;
    @SerializeField(DataType.Float32)
    public m_regionID: number;

    @SerializeField(DataType.Object, true, TileWallVO)
    public m_walls: Array<TileWallVO>;
    @SerializeField(DataType.Float32)
    public m_photoRegionID: number;
}

class MapEntityVO {
    @SerializeField(DataType.String)
    public m_prefabName: string;
    @SerializeField(DataType.String)
    public m_imageName: string;

    @SerializeField(DataType.Float32)
    public m_offsetX: number;
    @SerializeField(DataType.Float32)
    public m_offsetY: number;
    @SerializeField(DataType.Float32)
    public m_pivotX: number;
    @SerializeField(DataType.Float32)
    public m_pivotY: number;
    @SerializeField(DataType.Float32)
    public m_scale: number;
}

class TileMapVO {
    @SerializeField(DataType.Float32)
    public m_width: number;
    @SerializeField(DataType.Float32)
    public m_height: number;
    @SerializeField(DataType.Float32)
    public m_tileWidth: number;
    @SerializeField(DataType.Float32)
    public m_tileHeight: number;

    @SerializeField(DataType.Object, true, TileVO)
    public m_tiles: Array<TileVO>;
    @SerializeField(DataType.Object, true, StaticItemVO)
    public m_staticItems: Array<StaticItemVO>;
    @SerializeField(DataType.Object, true, MapEntityVO)
    public m_mapEntities: Array<MapEntityVO>;
    @SerializeField(DataType.Float32, true)
    public m_tilesID: Array<number>;
}
