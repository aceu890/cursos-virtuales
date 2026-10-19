import type { NodeTypes } from "@xyflow/react";
import { AmmeterNode } from "./nodes/AmmeterNode";
import { ApplianceNode } from "./nodes/ApplianceNode";
import { BatteryNode } from "./nodes/BatteryNode";
import { MainSwitchNode, McbNode, RcdNode } from "./nodes/BreakerNode";
import { BulbNode } from "./nodes/BulbNode";
import { GroundNode } from "./nodes/GroundNode";
import { LightPoleNode } from "./nodes/LightPoleNode";
import { MultimeterNode } from "./nodes/MultimeterNode";
import { OutletNode } from "./nodes/OutletNode";
import { SwitchNode } from "./nodes/SwitchNode";
import { VoltageDetectorNode } from "./nodes/VoltageDetectorNode";
import { VoltmeterNode } from "./nodes/VoltmeterNode";

export const circuitNodeTypes: NodeTypes = {
  battery: BatteryNode,
  switch: SwitchNode,
  bulb: BulbNode,
  ground: GroundNode,
  mainSwitch: MainSwitchNode,
  rcd: RcdNode,
  mcb: McbNode,
  ammeter: AmmeterNode,
  voltmeter: VoltmeterNode,
  multimeter: MultimeterNode,
  voltageDetector: VoltageDetectorNode,
  lightPole: LightPoleNode,
  outlet: OutletNode,
  appliance: ApplianceNode,
};
