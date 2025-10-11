class GameLibrary {
    static Init() {
        let module = Process.findModuleByName('libg.so');
        GameLibrary.begin = module.base;
        GameLibrary.size = module.size;
        GameLibrary.end = GameLibrary.begin.add(GameLibrary.size);
    }
    static add(addr) {
        return GameLibrary.begin.add(addr);
    }
};

class Addresses {
    static GameMain = class {
        static CreateGameInstance = GameLibrary.add(0x33BCB8);
        static GetInstance = GameLibrary.add(0x2897E4);

        static Jump = GameLibrary.add(0x66DCEC);
        static Clean = GameLibrary.add(0x66E0A0);
    }

    static LoginMessage = class {
        static Jump = GameLibrary.add(0x493304);
        static Clean = GameLibrary.add(0x493EA8);
    }

    static InputSystem = class {
        static Update = class {
            static Jump = GameLibrary.add(0x68DE6C);
            static Clean = GameLibrary.add(0x68EE94);
        }
    }

    static CombatHUD = class {
        static UltiButtonActivated = class {
            static Jump = GameLibrary.add(0x7D8858);
            static Clean = GameLibrary.add(0x7D8C34);
        }
    }

    static RessourceManager = class {
        static Init = class {
            static Jump = GameLibrary.add(0x68A718);
            static Clean = GameLibrary.add(0x68B1F8);
        }
    }

    static Messaging = class {
        static Connect = class {
            static Jump = GameLibrary.add(0x39AD0C);
            static Clean = GameLibrary.add(0x39C55C);
        }
    }
}

class ArxanPatcher {
    static PatchFunction(address, value, text) {
        Interceptor.replace(GameLibrary.add(address), new NativeCallback(() => {
            if (text !== "") console.log(text)
            return value
        }, 'int', []))
    }

    static PatchJump(address, new_address) {
        Interceptor.replace(GameLibrary.add(address), GameLibrary.add(new_address));
    }

    static PatchImport(import_name, value, text) {
        Interceptor.replace(Module.findExportByName('libc.so', import_name), new NativeCallback(() => {
            if (text !== "") console.log(text)
            return value
        }, 'int', []))
    }

    static PatchString(address, string) {
        Memory.writeUtf8String(GameLibrary.add(address), string);
    }
}

class ArxanKiller {
    static Init() {
        ArxanKiller.PatchJumps();
        ArxanKiller.PatchChecks();
        ArxanKiller.PatchImports();
        ArxanKiller.PatchGuards();
        ArxanKiller.SmallPatches();
    }

    static PatchChecks() {
        ArxanPatcher.PatchFunction(0x8339F4, 0, ""); // AntiCheat::guard_callback
        ArxanPatcher.PatchFunction(0x6B7CD0, 0, ""); // AntiCheat::getAntihackFlags
        ArxanPatcher.PatchFunction(0x287814, 0, ""); // AntiCheat::hasHackerTools
        ArxanPatcher.PatchFunction(0x5169BC, 0, ""); // AntiCheat::isEmulator
        ArxanPatcher.PatchFunction(0x3AD6D0, 0, ""); // AntiCheat::isRepackaged
        ArxanPatcher.PatchFunction(0x50AB84, 0, ""); // AntiCheat::isRooted
        ArxanPatcher.PatchFunction(0x34466C, 0, ""); // AntiCheat::isSessionTampered
        ArxanPatcher.PatchFunction(0x4695A0, 0, ""); // AntiCheat::isSideLoaded
        ArxanPatcher.PatchFunction(0x94C248, 0, ""); // AntiCheat::isTampered
        ArxanPatcher.PatchFunction(0x2418C8, 0, ""); // AntiCheat::update - sm_stackGuardFailCount >= 9
        ArxanPatcher.PatchFunction(0x247670, 0, ""); // titan::com::supercell::titan::GameApp::isEmulator
        ArxanPatcher.PatchFunction(0x595C20, 1, ""); // titan::com::supercell::titan::GameApp::isSignatureValid
    }

    static PatchJumps() {
        ArxanPatcher.PatchJump(Addresses.GameMain.CreateGameInstance, Addresses.GameMain.GetInstance); // Replaces the g_createGameInstance function with the GameMain::getInstance function because it creates an instance of GameMain if the instance is not created yet
        ArxanPatcher.PatchJump(Addresses.LoginMessage.Jump, Addresses.LoginMessage.Clean);
        ArxanPatcher.PatchJump(Addresses.Messaging.Connect.Jump, Addresses.Messaging.Connect.Clean);
        ArxanPatcher.PatchJump(Addresses.InputSystem.Update.Jump, Addresses.InputSystem.Update.Clean);
        ArxanPatcher.PatchJump(Addresses.CombatHUD.UltiButtonActivated.Jump, Addresses.CombatHUD.UltiButtonActivated.Clean);
        ArxanPatcher.PatchJump(Addresses.RessourceManager.Init.Jump, Addresses.RessourceManager.Init.Clean);
    }

    static PatchImports() {
        ArxanPatcher.PatchImport("openat", -1, "");
        ArxanPatcher.PatchImport("qmemcpy", -1, "");
    }
    
    static PatchGuards() {
        RootDetection.KillRootDetection();
        FridaProtection.KillFridaProtection();
        MemoryGuard.KillMemoryGuard();
    }

    static SmallPatches() {
        ArxanPatcher.PatchString(0xC3411B, "i-love-useless-patches") // String: /sbin/.magisk
        ArxanPatcher.PatchString(0xFE9B67, "did-you-know-all-theses-patches-are-useless") // String: /sbin/magisk
        ArxanPatcher.PatchString(0xFE9B67, "did-you-know-all-theses-patches-are-useless") // String: /sbin/magisk
        ArxanPatcher.PatchString(0xFE9B67, "did-you-know-all-theses-patches-are-useless") // String: /sbin/magisk
        ArxanPatcher.PatchString(0xFE9B67, "did-you-know-all-theses-patches-are-useless") // String: /sbin/magisk
        ArxanPatcher.PatchString(0xFE9B67, "did-you-know-all-theses-patches-are-useless") // String: /sbin/magisk
    }
}

class RootDetection {
    static KillRootDetection() {
        ArxanPatcher.PatchFunction(0x4B62D0, 0, ""); // lv1_root_detect_tamper_action__ZL4initv
        ArxanPatcher.PatchFunction(0x1F1738, 0, ""); // lv1_root_detect_tamper_action__ZL15parse_proc_mapsPKcS0_PFviE
        ArxanPatcher.PatchFunction(0x49721C, 0, ""); // lv1_root_detect_non_tamper_action__ZL4initv
        ArxanPatcher.PatchFunction(0x2229DC, 0, ""); // lv1_root_detect_non_tamper_action__ZL15parse_proc_mapsPKcS0_PFviE
    }
}

class MemoryGuard {
    static KillMemoryGuard() {
        ArxanPatcher.PatchFunction(0x0BB540, 0, ""); // j_lv1_memory_guard__ZNSt6__ndk16__treeINS_12__value_typeINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS_6vectorI12AddressRangeNS5_IS9_EEEEEENS_19__map_value_compareIS7_SC_NS_4lessIS7_EELb1EEENS5_ISC_EEE7destroyEPNS_11__tree_nodeISC_PvEE
        ArxanPatcher.PatchFunction(0x0C827C, 0, ""); // lv1_memory_guard__GLOBAL__sub_I_AndroidMemoryAnomalyGuard_cpp
        ArxanPatcher.PatchFunction(0x866EC0, 0, ""); // lv1_memory_guard__ZL15parse_proc_mapsPKcS0_PFviE
        ArxanPatcher.PatchFunction(0xA16BA0, 0, ""); // lv1_memory_guard__ZNSt6__ndk13mapINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS_6vectorI12AddressRangeNS4_IS8_EEEENS_4lessIS6_EENS4_INS_4pairIKS6_SA_EEEEED2Ev
        ArxanPatcher.PatchFunction(0x9BEBF8, 0, ""); // lv1_memory_guard__ZNSt6__ndk16__treeINS_12__value_typeINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS_6vectorI12AddressRangeNS5_IS9_EEEEEENS_19__map_value_compareIS7_SC_NS_4lessIS7_EELb1EEENS5_ISC_EEE7destroyEPNS_11__tree_nodeISC_PvEE
    }
}

class FridaProtection {
    static KillFridaProtection() {
        ArxanPatcher.PatchFunction(0x4CE300, 0, ""); // lv1_frida_killer__ZL14parse_proc_tcpPKcS0_PFviE
        ArxanPatcher.PatchFunction(0x8BBA30, 0, ""); // lv1_frida_killer__ZL15parse_proc_mapsPKcS0_PFviE
        ArxanPatcher.PatchFunction(0x4F46A0, 0, ""); // lv1_frida_killer__ZL15parse_proc_unixPKcS0_PFviE
        ArxanPatcher.PatchFunction(0x24DDF8, 0, ""); // lv1_frida_killer__ZL15sigsegv_handleriP7siginfoPv
        ArxanPatcher.PatchFunction(0x532D20, 0, ""); // lv1_frida_killer__ZL18frida_guard_threadPv
        ArxanPatcher.PatchFunction(0x678BFC, 0, ""); // lv1_frida_killer__ZL19create_guard_threadv
        ArxanPatcher.PatchFunction(0x8C6CEC, 0, ""); // lv1_frida_killer__ZL22thread_control_handleriP7siginfoPv
        ArxanPatcher.PatchFunction(0x3C1D14, 0, ""); // lv1_frida_killer__ZL23create_detection_threadv
        ArxanPatcher.PatchFunction(0x2024F0, 0, ""); // lv1_frida_killer__ZL26frida_library_guard_threadPv
        ArxanPatcher.PatchFunction(0x5E922C, 0, ""); // lv1_frida_killer__ZL27create_library_guard_threadv
        ArxanPatcher.PatchFunction(0x57B7B4, 0, ""); // lv1_frida_killer__ZL8snprintfPcU17pass_object_size1jPKcz
        ArxanPatcher.PatchFunction(0x687CB0, 0, ""); // lv1_detect_frida_library__ZL14parse_proc_tcpPKcS0_PFviE
        ArxanPatcher.PatchFunction(0x0E7088, 0, ""); // lv1_detect_frida_library__ZL15parse_proc_mapsPKcS0_PFviE
        ArxanPatcher.PatchFunction(0x2306C8, 0, ""); // lv1_detect_frida_library__ZL15parse_proc_unixPKcS0_PFviE
        ArxanPatcher.PatchFunction(0x737B34, 0, ""); // lv1_detect_frida_library__ZL15sigsegv_handleriP7siginfoPv
        ArxanPatcher.PatchFunction(0x915100, 0, ""); // lv1_detect_frida_library__ZL18frida_guard_threadPv
        ArxanPatcher.PatchFunction(0x36ECF0, 0, ""); // lv1_detect_frida_library__ZL19create_guard_threadv
        ArxanPatcher.PatchFunction(0x345FAC, 0, ""); // lv1_detect_frida_library__ZL22thread_control_handleriP7siginfoPv
        ArxanPatcher.PatchFunction(0x512F58, 0, ""); // lv1_detect_frida_library__ZL23create_detection_threadv
        ArxanPatcher.PatchFunction(0x25715C, 0, ""); // lv1_detect_frida_library__ZL26frida_library_guard_threadPv
        ArxanPatcher.PatchFunction(0x5CFAF0, 0, ""); // lv1_detect_frida_library__ZL27create_library_guard_threadv
        ArxanPatcher.PatchFunction(0x4F9FC4, 0, ""); // lv1_detect_frida_library__ZL8snprintfPcU17pass_object_size1jPKcz
        ArxanPatcher.PatchFunction(0x83E870, 0, ""); // lv1_detect_frida_server__ZL14parse_proc_tcpPKcS0_PFviE
        ArxanPatcher.PatchFunction(0x7F4854, 0, ""); // lv1_detect_frida_server__ZL15parse_proc_mapsPKcS0_PFviE
        ArxanPatcher.PatchFunction(0x8402EC, 0, ""); // lv1_detect_frida_server__ZL15parse_proc_unixPKcS0_PFviE
        ArxanPatcher.PatchFunction(0x5917E0, 0, ""); // lv1_detect_frida_server__ZL15sigsegv_handleriP7siginfoPv
        ArxanPatcher.PatchFunction(0x4940B0, 0, ""); // lv1_detect_frida_server__ZL18frida_guard_threadPv
        ArxanPatcher.PatchFunction(0x2582F0, 0, ""); // lv1_detect_frida_server__ZL19create_guard_threadv
        ArxanPatcher.PatchFunction(0x678EA4, 0, ""); // lv1_detect_frida_server__ZL22thread_control_handleriP7siginfoPv
        ArxanPatcher.PatchFunction(0x4D00F0, 0, ""); // lv1_detect_frida_server__ZL23create_detection_threadv
        ArxanPatcher.PatchFunction(0x12EC20, 0, ""); // lv1_detect_frida_server__ZL26frida_library_guard_threadPv
        ArxanPatcher.PatchFunction(0x348890, 0, ""); // lv1_detect_frida_server__ZL27create_library_guard_threadv
        ArxanPatcher.PatchFunction(0x51BE60, 0, ""); // lv1_detect_frida_server__ZL8snprintfPcU17pass_object_size1jPKcz
        ArxanPatcher.PatchFunction(0x914C70, 0, ""); // frida_detected
    }
}

class ArxanKiller {
    v36 = class {
        static Init() {
            GameLibrary.Init();
            ArxanKiller.Init();
        }
    }
}

rpc.exports.init = ArxanKiller.v36.Init();
