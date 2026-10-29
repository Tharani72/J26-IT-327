// OmniSign SL - Web Bluetooth Low Energy (BLE) Client
const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"; 
const CHARACTERISTIC_RX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; 
const CHARACTERISTIC_TX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; 

class GloveBleService {
  device: any = null;
  rxCharacteristic: any = null;
  txCharacteristic: any = null;
  isConnected = false;

  async connect(onDataReceived: (data: any) => void): Promise<boolean> {
    try {
      const nav: any = navigator;
      if (!nav.bluetooth) {
        alert("ඔබේ Browser එකේ Web Bluetooth සහය නොදක්වයි. කරුණාකර Google Chrome හෝ Microsoft Edge භාවිතා කරන්න.");
        return false;
      }

      // 1. Chrome එකෙන් Bluetooth device එක තෝරා ගැනීම
      this.device = await nav.bluetooth.requestDevice({
        filters: [{ namePrefix: "OmniSign" }],
        optionalServices: [SERVICE_UUID]
      });

      const server = await this.device.gatt?.connect();
      const service = await server?.getPrimaryService(SERVICE_UUID);

      this.rxCharacteristic = await service?.getCharacteristic(CHARACTERISTIC_RX) || null;
      this.txCharacteristic = await service?.getCharacteristic(CHARACTERISTIC_TX) || null;

      // 2. Real-time දත්ත ලැබීම ආරම්භ කිරීම
      await this.txCharacteristic?.startNotifications();
      this.txCharacteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = new TextDecoder().decode(event.target.value);
        try {
          const parsed = JSON.parse(value);
          onDataReceived(parsed);
        } catch (e) {
          // parse stream
        }
      });

      this.isConnected = true;
      return true;
    } catch (err) {
      console.error("BLE Connection failed or cancelled:", err);
      return false;
    }
  }

  // Glove එකට විධාන යැවීම
  async sendCommand(command: object) {
    if (this.rxCharacteristic) {
      const data = new TextEncoder().encode(JSON.stringify(command));
      await this.rxCharacteristic.writeValue(data);
    }
  }

  disconnect() {
    if (this.device && this.device.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.isConnected = false;
  }
}

export const gloveBle = new GloveBleService();