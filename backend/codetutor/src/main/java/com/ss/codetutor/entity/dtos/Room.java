package com.ss.codetutor.entity.dtos;

import com.ss.codetutor.entity.dtos.Client;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

public class Room {
    private Map<String, Client> clients = new HashMap<>();

    public void put(String uid, Client client) {
        clients.put(uid, client);
    }

    public Client get(String uid) {
        return clients.get(uid);
    }

    public void remove(String uid) {
        clients.remove(uid);
    }

    public int size() {
        return clients.size();
    }

    public Collection<Client> getAllClients() {
        return clients.values();
    }
}
